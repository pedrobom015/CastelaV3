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


//require_once(ROOT_DIR . 'Domain/User.php');
//require_once(ROOT_DIR . 'Domain/Values/AccountStatus.php');
//require_once(ROOT_DIR . 'Domain/Values/FullName.php');
//require_once(ROOT_DIR . 'Domain/Values/UserPreferences.php');
//require_once(ROOT_DIR . 'lib/Email/Messages/AccountCreationEmail.php');

interface IProducerRepository extends IProducerViewRepository
{
    /**
     * @param string $userName
     * @return Producer
     */
    public function LoadByUsername($userName);

    /**
     * @param Producer $user
     * @return int
     */
    public function Add(Producer $producer);

    /**
     * @param string $userName
     * @return void
     */
    public function DeleteByUserName($userName);

    /**
     * @return int
     */
    public function GetCount();
}

interface IProducerViewRepository
{
    /**
     * @param string $userName
     * @return ProducerDto
     */
    function GetByName($userName);

    /**
     * @return ProducerDto[]
     */
    function GetAll();

    /**
     * @param int $pageNumber
     * @param int $pageSize
     * @param null|string $sortField
     * @param null|string $sortDirection
     * @return PageableData|ProducerItemView[]
     */
    public function GetList($pageNumber, $pageSize, $sortField = null, $sortDirection = null);

    /**
     * @param string $userName
     * @return int|null
     */
    public function ProducerExists($userName);
}

class ProducerRepository implements IProducerRepository
{
  /**
  * @var DomainCache
  */
   private $_cache;

   public function __construct()
   {
      //echo "entra31";
       $this->_cache = new DomainCache();
      //echo "entra32";
   }

   /**
  * @param $command SqlCommand
  * @return Producer
  */
   private function Load($command)
   {
       $reader = ServiceLocator::GetDatabase()->Query($command);

       if ($row = $reader->GetRow()) {
           $userName = $row[0];
           return $user;
       }
       else {
           return Producer::Null();
       }
   }

  /**
   * @param string $userName
   * @return Producer
   */
   public function LoadByUserName($userName)
   {
       if (!$this->_cache->Exists($userName)) {
           $command = new AdHocCommand("select * from productors where username = \"$userName\"");
           return $this->Load($command);
       }
       else {
           return $this->_cache->Get($userName);
       }
   }

  /**
   * @param Producer $user
   * @return int
   */
  public function Add(Producer $producer)
  {
    return null;
  }

  /**
   * @param string $userName
   * @return void
   */
  public function DeleteByUserName($userName)
  {
    return null;
  }

  /**
   * @return int
   */
  public function GetCount()
  {
    return null;
  }

  /**
   * @param string $userName
   * @return ProducerDto
   */
   public function GetByName($userName)
   {
       $command = new AdHocCommand("select * from productors where username = \"$userName\"");

       $reader = ServiceLocator::GetDatabase()->Query($command);

       if ($row = $reader->GetRow()) {
           return new ProducerDto($row[0]);
       }

       return null;
   }

  /**
   * @return ProducerDto[]
   */
   public function GetAll()
   {
       $command = new AdHocCommand("select * from productors");

       $reader = ServiceLocator::GetDatabase()->Query($command);
       $producers = array();

       while ($row = $reader->GetRow()) {
           $users[] = new ProducerDto($row[0]);
       }
       return $users;
   }

  /**
   * @param int $pageNumber
   * @param int $pageSize
   * @param null|string $sortField
   * @param null|string $sortDirection
   * @return PageableData|ProducerItemView[]
   */
  public function GetList($pageNumber, $pageSize, $sortField = null, $sortDirection = null)
  {
      $command = new AdHocCommand("select * from productors order by username");
      $builder = array('UserItemView', 'Create');
      return PageableDataStore::GetList($command, $builder, $pageNumber, $pageSize, $sortField, $sortDirection);
  }

  /**
   * @param string $userName
   * @return int|null
   */
  public function ProducerExists($userName)
  {
    return null;
  }
}

class ProducerDto
{
    public $UserName;

    public function __construct($userName)
    {
        $this->UserName = $userName;
    }

    public function Name()
    {
        return $this->UserName;
    }
}

class NullProducerDto extends ProducerDto
{
    public function __construct()
    {
        parent::__construct(null);
    }

    public function Name()
    {
        return null;
    }
}

class ProducerItemView
{
    public $Username;

    public static function Create($row)
    {
        $producer = new UserItemView();
        $producer->Username = $row[0];
        return $producer;
    }
}
