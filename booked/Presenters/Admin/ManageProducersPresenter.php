<?php
/**
 * Copyright 2011-2018 Nick Korbel
 *
 * This file is part of Booked Scheduler.
 *
 * Booked Scheduler is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Booked Scheduler is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Booked Scheduler.  If not, see <http://www.gnu.org/licenses/>.
 */

require_once(ROOT_DIR . 'Domain/Access/namespace.php');
require_once(ROOT_DIR . 'Presenters/ActionPresenter.php');
require_once(ROOT_DIR . 'lib/Application/Authentication/namespace.php');
require_once(ROOT_DIR . 'lib/Application/User/namespace.php');
require_once(ROOT_DIR . 'lib/Application/Admin/UserImportCsv.php');
require_once(ROOT_DIR . 'lib/Application/Admin/CsvImportResult.php');
require_once(ROOT_DIR . 'lib/Email/Messages/InviteUserEmail.php');
require_once(ROOT_DIR . 'lib/Email/Messages/AccountCreationForUserEmail.php');

class ManageProducersActions
{
    //const AddUser = 'addUser';
    const DeleteUser = 'deleteUser';
    const ImportUsers = 'importUsers';
    const DeleteMultipleUsers = 'deleteMultipleUsers';
}

interface IManageProducersPresenter
{
    //public function AddUser();

}

class ManageProducersPresenter extends ActionPresenter implements IManageProducersPresenter
{
    /**
     * @var IManageProducersPage
     */
    private $page;

    /**
     * @var \UserRepository
     */
    private $userRepository;

    /**
     * @param UserRepository $userRepository
     */
    public function SetUserRepository($userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * @param IManageProducersPage $page
     * @param UserRepository $userRepository
     */
    public function __construct(IManageProducersPage $page,
                                ProducerRepository $producerRepository)
    {
        parent::__construct($page);
        $this->page = $page;
        $this->producerRepository = $producerRepository;
        //$this->AddAction(ManageProducersActions::AddUser, 'AddUser');
        $this->AddAction(ManageProducersActions::DeleteUser, 'DeleteUser');
        $this->AddAction(ManageProducersActions::ImportUsers, 'ImportUsers');
        $this->AddAction(ManageProducersActions::DeleteMultipleUsers, 'DeleteMultipleUsers');
    }

    public function PageLoad()
    {
        //echo "entra21";
        $userList = $this->producerRepository->GetList($this->page->GetPageNumber(), $this->page->GetPageSize(),
                  $this->page->GetSortField(),
                  $this->page->GetSortDirection());
        //echo "entra22";
        $this->page->BindUsers($userList->Results());
        //echo "entra23";
        $this->page->BindPageInfo($userList->PageInfo());
        //echo "entra24";
        //$user = $this->producerRepository->Load(ServiceLocator::GetServer()->GetUserSession()->UserId);
        //echo "entra25";
    }

    /*
    public function AddUser()
    {
        $defaultHomePageId = Configuration::Instance()->GetKey(ConfigKeys::DEFAULT_HOMEPAGE, new IntConverter());
        $extraAttributes = array(
            UserAttribute::Organization => $this->page->GetOrganization(),
            UserAttribute::Phone => $this->page->GetPhone(),
            UserAttribute::Position => $this->page->GetPosition());

        $user = $this->manageUsersService->AddUser(
            $this->page->GetUserName(),
            $this->page->GetEmail(),
            $this->page->GetFirstName(),
            $this->page->GetLastName(),
            $this->page->GetPassword(),
            $this->page->GetTimezone(),
            Configuration::Instance()->GetKey(ConfigKeys::LANGUAGE),
            empty($defaultHomePageId) ? Pages::DEFAULT_HOMEPAGE_ID : $defaultHomePageId,
            $extraAttributes,
            $this->GetAttributeValues());

        $userId = $user->Id();
        $groupId = $this->page->GetUserGroup();

        if (!empty($groupId)) {
            $group = $this->groupRepository->LoadById($groupId);
            $group->AddUser($userId);
            $this->groupRepository->Update($group);
        }

        if ($this->page->SendEmailNotification()) {
            ServiceLocator::GetEmailService()->Send(new AccountCreationForUserEmail($user, $this->page->GetPassword(), ServiceLocator::GetServer()->GetUserSession()));
        }
    }*/

    public function DeleteUser()
    {
        $userId = $this->page->GetUserId();
        Log::Debug('Deleting user %s', $userId);

        $this->manageUsersService->DeleteUser($userId);
    }

    public function ProcessDataRequest($dataRequest)
    {
        if ($dataRequest == 'permissions') {
            $this->page->SetJsonResponse($this->GetUserResourcePermissions());
        }
        elseif ($dataRequest == 'groups') {
            $this->page->SetJsonResponse($this->GetUserGroups());
        }
        elseif ($dataRequest == 'all') {
            $users = $this->userRepository->GetAll();
            $this->page->SetJsonResponse($users);
        }
        elseif ($dataRequest == 'template') {
            $this->ShowTemplateCSV();
        }
		elseif ($dataRequest == 'export') {
			$this->ExportUsers();
		}
    }

    public function ImportUsers()
    {
		ini_set('max_execution_time', 600);

        $shouldUpdate = $this->page->GetUpdateOnImport();

        $attributes = $this->attributeService->GetByCategory(CustomAttributeCategory::USER);
        /** @var CustomAttribute[] $attributesIndexed */
        $attributesIndexed = array();
        /** @var CustomAttribute $attribute */
        foreach ($attributes as $attribute)
        {
            if (!$attribute->UniquePerEntity())
            {
                $attributesIndexed[strtolower($attribute->Label())] = $attribute;
            }
        }

        $groupsList = $this->groupViewRepository->GetList();
        /** @var GroupItemView[] $groups */
        $groups = $groupsList->Results();
        $groupsIndexed = array();
        foreach ($groups as $group) {
            $groupsIndexed[$group->Name()] = $group->Id();
        }

        $importFile = $this->page->GetImportFile();
        $csv = new UserImportCsv($importFile, $attributesIndexed);

        $importCount = 0;
        $messages = array();

        $rows = $csv->GetRows();

        if (count($rows) == 0) {
            $this->page->SetImportResult(new CsvImportResult(0, array(), 'Empty file or missing header row'));
            return;
        }

        for ($i = 0; $i < count($rows); $i++) {
            $row = $rows[$i];
            try {
                $emailValidator = new EmailValidator($row->email);
                $uniqueEmailValidator = new UniqueEmailValidator($this->userRepository, $row->email);
                $uniqueUsernameValidator = new UniqueUserNameValidator($this->userRepository, $row->username);

                $emailValidator->Validate();
                if (!$emailValidator->IsValid()) {
                    $evMsgs = $emailValidator->Messages();
                    $messages[] = $evMsgs[0] . " ({$row->email})";
                    continue;
                }

                if (!$shouldUpdate) {
                    $uniqueEmailValidator->Validate();
                    $uniqueUsernameValidator->Validate();

                    if (!$uniqueEmailValidator->IsValid()) {
                        $uevMsgs = $uniqueEmailValidator->Messages();
                        $messages[] = $uevMsgs[0] . " ({$row->email})";
                        continue;
                    }
                    if (!$uniqueUsernameValidator->IsValid()) {
                        $uuvMsgs = $uniqueUsernameValidator->Messages();
                        $messages[] = $uuvMsgs[0] . " ({$row->username})";
                        continue;
                    }
                }

                $timezone = empty($row->timezone) ? Configuration::Instance()->GetKey(ConfigKeys::DEFAULT_TIMEZONE) : $row->timezone;
                $password = empty($row->password) ? 'password' : $row->password;
                $language = empty($row->language) ? 'en_us' : $row->language;

                if ($shouldUpdate)
                {
                    $user = $this->manageUsersService->LoadUser($row->email);
                    if ($user->Id() == null)
                    {
                        $shouldUpdate = false;
                    }
                    else{
                        $user->ChangeName($row->firstName, $row->lastName);
                        $password = $this->passwordEncryption->EncryptPassword($row->password);
                        $user->ChangePassword($password->EncryptedPassword(), $password->Salt());
                        $user->ChangeTimezone($timezone);
                        $user->ChangeAttributes($row->phone, $row->organization, $row->position);
                    }

                }
                if (!$shouldUpdate) {
                    $user = $this->manageUsersService->AddUser($row->username, $row->email, $row->firstName, $row->lastName, $password, $timezone, $language,
                        Configuration::Instance()->GetKey(ConfigKeys::DEFAULT_HOMEPAGE),
                        array(UserAttribute::Phone => $row->phone, UserAttribute::Organization => $row->organization, UserAttribute::Position => $row->position),
                        array());
                }

                $userGroups = array();
                foreach ($row->groups as $groupName) {
                    if (array_key_exists($groupName, $groupsIndexed)) {
                        Log::Debug('Importing user %s with group %s', $row->username, $groupName);
                        $userGroups[] = new UserGroup($groupsIndexed[$groupName], $groupName);
                    }
                }

                if (count($userGroups) > 0) {
                    $user->ChangeGroups($userGroups);
                }

                foreach ($row->attributes as $label => $value)
                {
                    if (empty($value))
                    {
                        continue;
                    }
                    if (array_key_exists($label, $attributesIndexed))
                    {
                        $attribute = $attributesIndexed[$label];
                        $user->ChangeCustomAttribute(new AttributeValue($attribute->Id(), $value));
                    }
                }

                if (count($userGroups) > 0 || count($row->attributes) > 0 || $shouldUpdate)
                {
                    $this->userRepository->Update($user);
                }

                $importCount++;
            } catch (Exception $ex) {
                Log::Error('Error importing users. %s', $ex);
            }
        }

        $this->page->SetImportResult(new CsvImportResult($importCount, $csv->GetSkippedRowNumbers(), $messages));
    }


	public function DeleteMultipleUsers()
	{
		$ids = $this->page->GetDeletedUserIds();
		Log::Debug('User multiple delete. Ids=%s', implode(',', $ids));
		foreach ($ids as $id)
		{
			$this->manageUsersService->DeleteUser($id);
		}
	}

}
