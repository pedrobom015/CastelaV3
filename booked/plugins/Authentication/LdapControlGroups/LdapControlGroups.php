<?php

require_once(ROOT_DIR . 'lib/Application/Authentication/namespace.php');
require_once(ROOT_DIR . 'plugins/Authentication/Ldap/namespace.php');

class LdapControlGroups extends Ldap
{
        public function Login($username, $loginContext)
        {
                $session= parent::Login($username, $loginContext);
                $userId = $session->UserId;
                
                // Productor group id
                
                $addgroupid_productor_res = ServiceLocator::GetDatabase()->Query(new AdHocCommand("select group_id from groups where name = 'productors'"));
                
                while ($row = $addgroupid_productor_res->GetRow())
                {
                        $addgroupid_productor = $row['group_id'];
                }
      
                // Find out if user has to be productor
                $isproductor_res = ServiceLocator::GetDatabase()->Query(new AdHocCommand("select count(*) from productors where username = \"$username\""));
                $srow = $isproductor_res->GetRow();
                $isproductor = $srow['count(*)'];

                // Find out if user is in group productors
                $ingroup_res = ServiceLocator::GetDatabase()->Query(new AdHocCommand("select count(*) from user_groups where user_id = \"$userId\" and group_id = \"$addgroupid_productor\""));
                $srow = $ingroup_res->GetRow();
                $ingroup = $srow['count(*)'];
                
                // If is not a productor and is in group, delete the group assignment
                if(!$isproductor && $ingroup) {
                
                        ServiceLocator::GetDatabase()->Execute(new AdHocCommand("delete from user_groups where user_id = $userId and group_id = $addgroupid_productor"));
                }
                // If is a productor and is not in group, insert the group assignment
                if($isproductor && !$ingroup) {
                        ServiceLocator::GetDatabase()->Execute(new AdHocCommand("insert into user_groups (user_id, group_id) VALUES ($userId, $addgroupid_productor)"));
                }
                return $session;
        }
}

?>