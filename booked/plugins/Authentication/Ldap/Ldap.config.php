<?php
/**
Copyright 2012-2018 Nick Korbel

This file is part of Booked Scheduler.

Booked Scheduler is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Booked Scheduler is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Booked Scheduler.  If not, see <http://www.gnu.org/licenses/>.
*/

// see http://pear.php.net/manual/en/package.networking.net-ldap2.connecting.php

$conf['settings']['host'] = getenv('BOOKED_LDAP_SETTINGS_HOST'); // comma separated list of ldap servers such as mydomain1,localhost
$conf['settings']['port'] = getenv('BOOKED_LDAP_SETTINGS_PORT');      // default ldap port 389 or 636 for ssl.
$conf['settings']['version'] = getenv('BOOKED_LDAP_SETTINGS_VERSION');        // LDAP protocol version
$conf['settings']['starttls'] = getenv('BOOKED_LDAP_SETTINGS_STARTTLS');    // TLS is started after connecting
$conf['settings']['binddn'] = getenv('BOOKED_LDAP_SETTINGS_BINDDN');    // The distinguished name to bind as (username). If you don't supply this, an anonymous bind will be established.
$conf['settings']['bindpw'] = getenv('BOOKED_LDAP_SETTINGS_BINDPW');    // Password for the binddn. If the credentials are wrong, the bind will fail server-side and an anonymous bind will be established instead. An empty bindpw string requests an unauthenticated bind.
$conf['settings']['basedn'] = getenv('BOOKED_LDAP_SETTINGS_BASEDN');    // LDAP base name (eg. dc=example,dc=com)
$conf['settings']['filter'] = getenv('BOOKED_LDAP_SETTINGS_FILTER');    // Default search filter
$conf['settings']['scope'] = getenv('BOOKED_LDAP_SETTINGS_SCOPE');    // Search scope (eg. uid)
$conf['settings']['required.group'] = getenv('BOOKED_LDAP_SETTINGS_REQUIRED_GROUP');    // Required group (empty if not necessary) (eg. cn=MyGroup,cn=Groups,dc=example,dc=com)
$conf['settings']['database.auth.when.ldap.user.not.found'] = getenv('BOOKED_LDAP_SETTINGS_DATABASE_AUTH_WHEN_LDAP_USER_NOT_FOUND');    // if ldap auth fails, authenticate against Booked Scheduler database
$conf['settings']['ldap.debug.enabled'] = getenv('BOOKED_LDAP_SETTINGS_LDAP_DEBUG_ENABLED');    // if LDAP2 should use debug logging
$conf['settings']['attribute.mapping'] = getenv('BOOKED_LDAP_SETTINGS_ATTRIBUTE_MAPPING');    // mapping of required attributes to attribute names in your directory
$conf['settings']['user.id.attribute'] = getenv('BOOKED_LDAP_SETTINGS_USER_ID_ATTRIBUTE');    // the attribute name for user identification
$conf['settings']['sync.groups'] = getenv('BOOKED_LDAP_SETTINGS_SYNC_GROUPS');
$conf['settings']['prevent.clean.username'] = getenv('BOOKED_LDAP_SETTINGS_PREVENT_CLEAN_USERNAME');    // If the username is an email address or contains the domain, clean it
?>