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

require_once(ROOT_DIR . 'config/timezones.php');
require_once(ROOT_DIR . 'Pages/IPageable.php');
require_once(ROOT_DIR . 'Pages/Admin/AdminPage.php');
require_once(ROOT_DIR . 'Pages/Ajax/AutoCompletePage.php');
require_once(ROOT_DIR . 'Presenters/Admin/ManageProducersPresenter.php');
require_once(ROOT_DIR . 'Domain/Access/namespace.php');
require_once(ROOT_DIR . 'lib/Application/Attributes/namespace.php');

interface IManageProducersPage extends IPageable, IActionPage
{
	/**
	 * @param UserItemView[] $users
	 * @return void
	 */
	function BindUsers($users);

	/**
	 * @return int
	 */
	public function GetUserId();

	/**
	 * @param mixed $objectToSerialize
	 * @return void
	 */
	public function SetJsonResponse($objectToSerialize);

	/**
	 * @param CsvImportResult $importResult
	 */
	public function SetImportResult($importResult);

	public function ShowExportCsv();

	/**
	 * @return int[]
	 */
	public function GetDeletedUserIds();

    /**
     * @return bool
     */
    public function GetUpdateOnImport();
}

class ManageProducersPage extends ActionPage implements IManageProducersPage
{
	/**
	 * @var \ManageProducersPresenter
	 */
	protected $_presenter;

	/**
	 * @var \PageablePage
	 */
	protected $pageable;

	public function __construct()
	{
		//echo "entra11";
		$serviceFactory = new ManageUsersServiceFactory();
		//echo "entra12";
		parent::__construct('ManageProducers', 1);
		//echo "entra13";
		$this->_presenter = new ManageProducersPresenter(
				$this,
				new ProducerRepository());
		//echo "entra14";
		$this->pageable = new PageablePage($this);
		//echo "entra15";
	}

	public function ProcessPageLoad()
	{
		//echo "entra16";
		$this->_presenter->PageLoad();
		//echo "entra17";
		$config = Configuration::Instance();

		$this->Set('Timezone', $config->GetDefaultTimezone());
		$this->Set('Timezones', $GLOBALS['APP_TIMEZONES']);
		$this->Set('Languages', $GLOBALS['APP_TIMEZONES']);
		$this->Set('ManageGroupsUrl', Pages::MANAGE_GROUPS);
		$this->Set('ManageReservationsUrl', Pages::MANAGE_RESERVATIONS);
		$this->Set('FilterStatusId', $this->GetFilterStatusId());
		$this->Set('PerUserColors', $config->GetSectionKey(ConfigSection::SCHEDULE, ConfigKeys::SCHEDULE_PER_USER_COLORS, new BooleanConverter()));
		$this->Set('CreditsEnabled', $config->GetSectionKey(ConfigSection::CREDITS, ConfigKeys::CREDITS_ENABLED, new BooleanConverter()));
		$url = $this->server->GetUrl();
		$exportUrl = BookedStringHelper::Contains($url, '?') ? $url . '&dr=export' : $this->server->GetRequestUri() . '?dr=export';
		$this->Set('ExportUrl', $exportUrl);

		$this->RenderTemplate();
	}

	public function BindStatusDescriptions()
	{
		$resources = Resources::GetInstance();
		$this->Set('statusDescriptions',
				   array(AccountStatus::ALL => $resources->GetString('All'), AccountStatus::ACTIVE => $resources->GetString('Active'), AccountStatus::AWAITING_ACTIVATION => $resources->GetString('Pending'), AccountStatus::INACTIVE => $resources->GetString('Inactive')));

	}

	protected function RenderTemplate()
	{
		$this->Display('Admin/Users/manage_producers.tpl');
	}

	public function BindPageInfo(PageInfo $pageInfo)
	{
		$this->pageable->BindPageInfo($pageInfo);
	}

	public function GetPageNumber()
	{
		return $this->pageable->GetPageNumber();
	}

	public function GetPageSize()
	{
		return $this->pageable->GetPageSize();
	}

	public function BindUsers($users)
	{
		$this->Set('users', $users);
	}

	public function ProcessAction()
	{
		$this->_presenter->ProcessAction();
	}

	public function ProcessDataRequest($dataRequest)
	{
		$this->_presenter->ProcessDataRequest($dataRequest);
	}

	/**
	 * @return int
	 */
	public function GetUserId()
	{
		$id = $this->GetQuerystring(QueryStringKeys::USER_ID);
		if (empty($id))
		{
			$id = $this->GetForm(FormKeys::PK);
		}

		return $id;
	}

	/**
	 * @param BookableResource[] $resources
	 * @return void
	 */
	public function BindResources($resources)
	{
		$this->Set('resources', $resources);
	}

	/**
	 * @return int[] resource ids the user has permission to
	 */
	public function GetAllowedResourceIds()
	{
		return $this->GetForm(FormKeys::RESOURCE_ID);
	}

	/**
	 * @return string
	 */
	public function GetPassword()
	{
		return $this->GetForm(FormKeys::PASSWORD);
	}

	/**
	 * @param mixed $objectToSerialize
	 * @return void
	 */
	public function SetJsonResponse($objectToSerialize)
	{
		parent::SetJson($objectToSerialize);
	}

	/**
	 * @return string
	 */
	public function GetEmail()
	{
		return $this->GetForm(FormKeys::EMAIL);
	}

	/**
	 * @return string
	 */
	public function GetUserName()
	{
		return $this->GetForm(FormKeys::USERNAME);
	}

	public function GetFirstName()
	{
		return $this->GetForm(FormKeys::FIRST_NAME);
	}

	public function GetLastName()
	{
		return $this->GetForm(FormKeys::LAST_NAME);
	}

	public function GetTimezone()
	{
		return $this->GetForm(FormKeys::TIMEZONE);
	}

	public function GetPhone()
	{
		return $this->GetForm(FormKeys::PHONE);
	}

	public function GetPosition()
	{
		return $this->GetForm(FormKeys::POSITION);
	}

	public function GetOrganization()
	{
		return $this->GetForm(FormKeys::ORGANIZATION);
	}

	public function GetLanguage()
	{
		return $this->GetForm(FormKeys::LANGUAGE);
	}

	public function BindAttributeList($attributeList)
	{
		$this->Set('AttributeList', $attributeList);
	}

	public function GetAttributes()
	{
		return AttributeFormParser::GetAttributes($this->GetForm(FormKeys::ATTRIBUTE_PREFIX));
	}

	public function GetFilterStatusId()
	{
		$statusId = $this->GetQuerystring(QueryStringKeys::ACCOUNT_STATUS);
		return empty($statusId) ? AccountStatus::ALL : $statusId;
	}

	public function GetUserGroup()
	{
		return $this->GetForm(FormKeys::GROUP_ID);
	}

	public function BindGroups($groups)
	{
		$this->Set('Groups', $groups);
	}

	public function GetReservationColor()
	{
		return $this->GetForm(FormKeys::RESERVATION_COLOR);
	}

	public function GetValue()
	{
		return $this->GetForm(FormKeys::VALUE);
	}

	public function GetName()
	{
		return $this->GetForm(FormKeys::NAME);
	}


	public function ShowTemplateCSV($attributes)
	{
        $this->Set('attributes', $attributes);
		$this->DisplayCsv('Admin/Users/import_user_template_csv.tpl', 'users.csv');
	}

	public function GetImportFile()
	{
		return $this->server->GetFile(FormKeys::USER_IMPORT_FILE);
	}

	public function SetImportResult($importResult)
	{
		$this->SetJsonResponse($importResult);
	}

	public function GetInvitedEmails()
	{
		return $this->GetForm(FormKeys::INVITED_EMAILS);
	}

	public function ShowExportCsv()
	{
		$this->DisplayCsv('Admin/Users/users_csv.tpl', 'users.csv');
	}

	public function GetDeletedUserIds()
	{
		$ids = $this->GetForm(FormKeys::USER_ID);
		if (!is_array($ids))
		{
			return array($ids);
		}

		return $ids;
	}

    public function SendEmailNotification()
    {
        return $this->GetCheckbox(FormKeys::SEND_AS_EMAIL);
    }

    public function GetUpdateOnImport()
    {
        return $this->GetCheckbox(FormKeys::UPDATE_ON_IMPORT);
    }
}
