<?php
/**
Copyright 2011-2018 Nick Korbel

This file is part of Booked Scheduler is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Booked Scheduler.  If not, see <http://www.gnu.org/licenses/>.
*/

require_once(ROOT_DIR . 'lib/Application/Authorization/namespace.php');
require_once(ROOT_DIR . 'lib/Common/namespace.php');

class ProductorValidationRule implements IReservationValidationRule
{
	/**
	 * @var IUserRepository
	 */
	private $userRepository;

	public function __construct(IUserRepository $userRepository)
	{
		$this->userRepository = $userRepository;
	}

	/**
	 * @param ReservationSeries $reservationSeries
	 * @param $retryParameters
	 * @return ReservationRuleResult
	 */
	public function Validate($reservationSeries, $retryParameters)
	{
		/**
		 * @var UserSession
		 */
		$currentUserSession = $reservationSeries->BookedBy();
		
		if (in_array(9, $currentUserSession->Groups)) {
			Log::Debug('SPM! User is productor');
			/**
			 * @var User
			 */
			$currentUser = $this->userRepository->LoadById($reservationSeries->UserId());
			
			$now = new Date('today');
			if ($currentUser->isSanctioned($now)) {
				return new ReservationRuleResult(false, Resources::GetInstance()->GetString('UserSanctioned'));		
			} else if (!$currentUser->isValid($now)) {
				return new ReservationRuleResult(false, Resources::GetInstance()->GetString('UserInvalid'));		
			}

			
		} else {
			Log::Debug('SPM! User is not productor! groups:"%s"', implode(', ', $currentUserSession->Groups));
		}
		Log::Debug('SPM! ProductorValidationRule=TRUE');
		return new ReservationRuleResult(true);
	}
}