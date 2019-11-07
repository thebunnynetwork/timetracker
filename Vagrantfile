
$postgresBootstrap = <<SCRIPT

  #!/bin/sh -e

  # Edit the following to change the name of the database user that will be created:
  APP_DB_USER=timetracker
  APP_DB_PASS=test

  # Edit the following to change the name of the database that is created (defaults to the user name)
  APP_DB_NAME=$APP_DB_USER

  # Edit the following to change the version of PostgreSQL that is installed
  PG_VERSION=9.6

  ###########################################################
  # Changes below this line are probably not necessary
  ###########################################################
  print_db_usage () {
    echo "Your PostgreSQL database has been setup and can be accessed on your local machine on the forwarded port (default: 15432)"
    echo "  Host: localhost"
    echo "  Port: 15432"
    echo "  Database: $APP_DB_NAME"
    echo "  Username: $APP_DB_USER"
    echo "  Password: $APP_DB_PASS"
    echo ""
    echo "Admin access to postgres user via VM:"
    echo "  vagrant ssh"
    echo "  sudo su - postgres"
    echo ""
    echo "psql access to app database user via VM:"
    echo "  vagrant ssh"
    echo "  sudo su - postgres"
    echo "  PGUSER=$APP_DB_USER PGPASSWORD=$APP_DB_PASS psql -h localhost $APP_DB_NAME"
    echo ""
    echo "Env variable for application development:"
    echo "  DATABASE_URL=postgresql://$APP_DB_USER:$APP_DB_PASS@localhost:15432/$APP_DB_NAME"
    echo ""
    echo "Local command to access the database via psql:"
    echo "  PGUSER=$APP_DB_USER PGPASSWORD=$APP_DB_PASS psql -h localhost -p 15432 $APP_DB_NAME"
  }

  export DEBIAN_FRONTEND=noninteractive

  PROVISIONED_ON=/etc/vm_provision_on_timestamp
  if [ -f "$PROVISIONED_ON" ]
  then
    echo "VM was already provisioned at: $(cat $PROVISIONED_ON)"
    echo "To run system updates manually login via 'vagrant ssh' and run 'apt-get update && apt-get upgrade'"
    echo ""
    print_db_usage
    exit
  fi

  PG_REPO_APT_SOURCE=/etc/apt/sources.list.d/pgdg.list
  if [ ! -f "$PG_REPO_APT_SOURCE" ]
  then
    # Add PG apt repo:
    echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" > "$PG_REPO_APT_SOURCE"

    # Add PGDG repo key:
    wget --quiet -O - https://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | apt-key add -
  fi

  # Update package list and upgrade all packages
  apt-get update
  apt-get -y upgrade

  apt-get -y install "postgresql-$PG_VERSION" "postgresql-contrib-$PG_VERSION"

  PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
  PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
  PG_DIR="/var/lib/postgresql/$PG_VERSION/main"

  # Edit postgresql.conf to change listen address to '*':
  sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

  # Append to pg_hba.conf to add password auth:
  echo "host    all             all             all                     md5" >> "$PG_HBA"

  # Explicitly set default client_encoding
  echo "client_encoding = utf8" >> "$PG_CONF"

  # Restart so that all new config is loaded:
  service postgresql restart

cat << EOF | su - postgres -c psql
CREATE EXTENSION pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create the database user:
CREATE USER $APP_DB_USER WITH PASSWORD '$APP_DB_PASS';
CREATE SCHEMA $APP_DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE postgres TO $APP_DB_USER;
GRANT ALL PRIVILEGES ON SCHEMA timetracker TO $APP_DB_USER;
CREATE TABLE $APP_DB_NAME.auth_tokens
(
  token text,
  userid integer,
  expires bigint,
  created bigint,
  active boolean
);
CREATE TABLE $APP_DB_NAME.users
(
  userid serial NOT NULL,
  username text,
  password text,
  admin boolean,
  poweruser boolean,
  CONSTRAINT users_pkey PRIMARY KEY (userid)
);
CREATE TABLE $APP_DB_NAME.sprints
(
  sprintid serial NOT NULL,
  userid integer,
  sprintname text,
  daterange text,
  CONSTRAINT sprints_pkey PRIMARY KEY (sprintid)
);
CREATE TABLE $APP_DB_NAME.tasktypes
(
  tasktypeid serial NOT NULL,
  prefix text,
  description text,
  CONSTRAINT tasktypes_pkey PRIMARY KEY (tasktypeid)
);
CREATE TABLE $APP_DB_NAME.timeentries
(
  timeentryid serial NOT NULL,
  sprintid integer,
  day text,
  task text,
  tasktypeid integer,
  description text,
  "time" text,
  CONSTRAINT timeentries_pkey PRIMARY KEY (timeentryid)
);
INSERT INTO timetracker.users (
	username,
	password,
	admin,
	poweruser)
	VALUES (
		'admin',
		CRYPT('timetracker', gen_salt('bf')),
		't',
		't');
INSERT INTO timetracker.tasktypes (
	prefix,
	description)
	SELECT 'CLN', 'Cleaning'
	UNION SELECT 'DEV', 'Development'
	UNION SELECT 'EXC', 'Exercise'
	UNION SELECT 'LRN', 'Learning'
	UNION SELECT 'ORG', 'Organization'
	UNION SELECT 'PLAY', 'Play'
	UNION SELECT 'PUB', 'Publish/Deploy'
	UNION SELECT 'REL', 'Relationships'
	UNION SELECT 'SLEEP', 'Sleep'
	UNION SELECT 'SPR', 'Spirituality';
GRANT ALL PRIVILEGES ON TABLE timetracker.auth_tokens TO $APP_DB_USER;
GRANT ALL PRIVILEGES ON TABLE timetracker.users TO $APP_DB_USER;
GRANT ALL PRIVILEGES ON TABLE timetracker.sprints TO $APP_DB_USER;
GRANT ALL PRIVILEGES ON TABLE timetracker.tasktypes TO $APP_DB_USER;
GRANT ALL PRIVILEGES ON TABLE timetracker.timeentries TO $APP_DB_USER;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA timetracker TO $APP_DB_USER;
SET search_path TO $APP_DB_NAME, public;
EOF

  # Tag the provision time:
  date > "$PROVISIONED_ON"

  echo "Successfully created PostgreSQL dev virtual machine."
  echo ""
  print_db_usage


SCRIPT

# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "ubuntu/xenial64"


  config.vm.define "main" do |main|

    main.vm.network "private_network", ip: "192.168.33.10"
    main.vm.synced_folder "./data", "/vagrant_data"

    main.vm.provision "shell", inline: <<-SHELL
      apt-get update
      apt-get install -y python-software-properties
      curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
      apt-get install -y nodejs build-essential
      cd /vagrant/TimeTrackerApp
      npm install
	  #apt-get install -y python-pip
	  #pip install psycopg2
      cp /vagrant/nodeproxy.service /etc/systemd/system/nodeproxy.service
      systemctl enable nodeproxy.service
      systemctl start nodeproxy.service
    SHELL
  end
  config.vm.define "postgres" do |postgres|
    postgres.vm.network "private_network", ip: "192.168.33.80"
	postgres.vm.synced_folder "./data", "/vagrant_data"
    postgres.vm.provision "shell", inline: $postgresBootstrap
    postgres.vm.host_name = "postgresql"
  end

end
