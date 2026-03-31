{*
Copyright 2011-2018 Nick Korbel

This file is part of Booked Scheduler.

Booked Scheduler is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Booked Scheduler is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Booked Scheduler.  If not, see <http://www.gnu.org/licenses/>.
*}

{include file='globalheader.tpl' Qtip=true InlineEdit=true}

<div id="page-manage-reservations" class="admin-page">
	<div>
		<h1>{translate key=ManageReturns}</h1>
	</div>

	<div class="panel panel-default filterTable" id="filter-reservations-panel">
		<div class="panel-heading"><span class="glyphicon glyphicon-filter"></span> {translate key="FilterBy"} {showhide_icon}</div>
		<div class="panel-body">
			{assign var=groupClass value="col-xs-12 col-sm-4 col-md-3"}
			<form id="filterForm" role="form">
				<div class="form-group filter-dates {$groupClass}">
					<input id="startDate" type="text" class="form-control dateinput inline"
						   value="{formatdate date=$StartDate}"/>
					<input id="formattedStartDate" type="hidden" value="{formatdate date=$StartDate key=system}"/>
					-
					<input id="endDate" type="text" class="form-control dateinput inline"
						   value="{formatdate date=$EndDate}"/>
					<input id="formattedEndDate" type="hidden" value="{formatdate date=$EndDate key=system}"/>
        </div>
				<div class="form-group filter-user {$groupClass}">
					<input id="userId" type="text" class="form-control" value="{$UserIdFilter}"
						   placeholder="{translate key=UserNIU}"/>
                    <span class="searchclear glyphicon glyphicon-remove-circle" ref="userId"></span>
        </div>
				<div class="form-group filter-resource {$groupClass}">
					<select id="resourceId" class="form-control">
						<option value="">{translate key=AllResources}</option>
						{object_html_options options=$Resources key='GetId' label="GetName" selected=$ResourceId}
					</select>
				</div>
			</form>
		</div>
		<div class="panel-footer">
			{filter_button id="filter" class="btn-sm"}
			{reset_button id="clearFilter" class="btn-sm"}
		</div>
	</div>

	<table class="table admin-panel" id="reservationTable">
		{assign var=colCount value=11}
		<thead>
		<tr>
			<th class="id hidden">&nbsp;</th>
			<th>{sort_column key=User field=ColumnNames::OWNER_LAST_NAME}</th>
			<th>{sort_column key=Resource field=ColumnNames::RESOURCE_NAME}</th>
			<th>{sort_column key=Title field=ColumnNames::RESERVATION_TITLE}</th>
			<th>{sort_column key=BeginDate field=ColumnNames::RESERVATION_START}</th>
			<th>{sort_column key=EndDate field=ColumnNames::RESERVATION_END}</th>
		</tr>
		</thead>
		<tbody>
		  {foreach from=$reservations item=reservation}
			  		{include file='Admin/Reservations/technician_return.tpl' reservation=$reservation}
		  {/foreach}
		</tbody>
		<tfoot>
		<tr>
			<td colspan="{$colCount-1}"></td>
			<td class="action-delete"><a href="#" id="delete-selected" class="no-show" title="{translate key=Delete}"><span class="fa fa-trash icon remove"></span></a></td>
		</tr>
		</tfoot>
	</table>

	{pagination pageInfo=$PageInfo}

	<div class="modal fade" id="deleteInstanceDialog" tabindex="-1" role="dialog"
		 aria-labelledby="deleteInstanceDialogLabel" aria-hidden="true">
		<div class="modal-dialog">
			<form id="deleteInstanceForm" method="post">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
						<h4 class="modal-title" id="deleteInstanceDialogLabel">{translate key=Delete}</h4>
					</div>
					<div class="modal-body">
						<div class="delResResponse"></div>
						<div class="alert alert-warning">
							{translate key=DeleteWarning}
						</div>

						<input type="hidden" {formname key=SERIES_UPDATE_SCOPE}
							   value="{SeriesUpdateScope::ThisInstance}"/>
						<input type="hidden" {formname key=REFERENCE_NUMBER} value="" class="referenceNumber"/>
					</div>
					<div class="modal-footer">
						{cancel_button}
						{delete_button}
						{indicator}
					</div>
				</div>
			</form>
		</div>
	</div>

	<div class="modal fade" id="deleteSeriesDialog" tabindex="-1" role="dialog"
		 aria-labelledby="deleteSeriesDialogLabel"
		 aria-hidden="true">
		<div class="modal-dialog">
			<form id="deleteSeriesForm" method="post">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
						<h4 class="modal-title" id="deleteSeriesDialogLabel">{translate key=Delete}</h4>
					</div>
					<div class="modal-body">
						<div class="alert alert-warning">
							{translate key=DeleteWarning}
						</div>
						<input type="hidden" id="hdnSeriesUpdateScope" {formname key=SERIES_UPDATE_SCOPE} />
						<input type="hidden" {formname key=REFERENCE_NUMBER} value="" class="referenceNumber"/>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default cancel"
								data-dismiss="modal">{translate key='Cancel'}</button>

						<button type="button" class="btn btn-danger saveSeries btnUpdateThisInstance" id="btnUpdateThisInstance">
							{translate key='ThisInstance'}
						</button>
						<button type="button" class="btn btn-danger saveSeries btnUpdateAllInstances" id="btnUpdateAllInstances">
							{translate key='AllInstances'}
						</button>
						<button type="button" class="btn btn-danger saveSeries btnUpdateFutureInstances" id="btnUpdateFutureInstances">
							{translate key='FutureInstances'}
						</button>
						{indicator}
					</div>
				</div>
			</form>
		</div>
	</div>

	<div id="deleteMultipleDialog" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="deleteMultipleModalLabel"
		 aria-hidden="true">
		<form id="deleteMultipleForm" method="post" ajaxAction="{ManageReservationsActions::DeleteMultiple}">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
						<h4 class="modal-title" id="deleteMultipleModalLabel">{translate key=Delete} (<span id="deleteMultipleCount"></span>)</h4>
					</div>
					<div class="modal-body">
						<div class="alert alert-warning">
							<div>{translate key=DeleteWarning}</div>

							<div>{translate key=DeleteMultipleReservationsWarning}</div>
						</div>

					</div>
					<div class="modal-footer">
						{cancel_button}
						{delete_button}
						{indicator}
					</div>
					<div id="deleteMultiplePlaceHolder" class="no-show"></div>
				</div>
			</div>
		</form>
	</div>

	<div id="inlineUpdateErrorDialog" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="inlineErrorLabel"
		 aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title" id="inlineErrorLabel">{translate key=Error}</h4>
				</div>
				<div class="modal-body">
					<div id="inlineUpdateErrors" class="hidden error">&nbsp;</div>
					<div id="reservationAccessError" class="hidden error"></div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default cancel"
							data-dismiss="modal">{translate key='OK'}</button>
				</div>
			</div>
		</div>
	</div>

	<div id="importReservationsDialog" class="modal" tabindex="-1" role="dialog" aria-labelledby="importReservationsModalLabel"
		 aria-hidden="true">
		<form id="importReservationsForm" class="form" role="form" method="post" enctype="multipart/form-data"
			  ajaxAction="{ManageReservationsActions::Import}">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
						<h4 class="modal-title" id="importReservationsModalLabel">{translate key=Import}</h4>
					</div>
					<div class="modal-body">
						<div id="importUserResults" class="validationSummary alert alert-danger no-show">
							<ul>
								{async_validator id="fileExtensionValidator" key=""}
							</ul>
						</div>
						<div id="importErrors" class="alert alert-danger no-show"></div>
						<div id="importResult" class="alert alert-success no-show">
							<span>{translate key=RowsImported}</span>

							<div id="importCount" class="inline bold">0</div>
							<span>{translate key=RowsSkipped}</span>

							<div id="importSkipped" class="inline bold">0</div>
							<a class="" href="{$smarty.server.SCRIPT_NAME}">{translate key=Done} <span
										class="fa fa-refresh"></span></a>
						</div>
						<div class="margin-bottom-25">
							<input type="file" {formname key=RESERVATION_IMPORT_FILE} />
						</div>
						<div id="importInstructions" class="alert alert-info">
							<div class="note">{translate key=ReservationImportInstructions}</div>
							<a href="{$smarty.server.SCRIPT_NAME}?dr=template" download="{$smarty.server.SCRIPT_NAME}?dr=template"
							   target="_blank">{translate key=GetTemplate} <span class="fa fa-download"></span></a>
						</div>
					</div>
					<div class="modal-footer">
						{cancel_button}
						{add_button key=Import}
						{indicator}
					</div>
				</div>
			</div>
		</form>
	</div>

    <div class="modal fade" id="termsOfServiceDialog" tabindex="-1" role="dialog"
         aria-labelledby="termsOfServiceDialogLabel" aria-hidden="true">
        <div class="modal-dialog">
            <form id="termsOfServiceForm" method="post" ajaxAction="termsOfService" enctype="multipart/form-data">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title" id="termsOfServiceDialogLabel">{translate key=TermsOfService}</h4>
                    </div>
                    <div class="modal-body">
                        <div>
                            <div class="radio inline-block">
                                <input type="radio" {formname key=TOS_METHOD} value="manual"
                                       id="tos_manual_radio"
                                       checked="checked" data-ref="tos_manual_div" class="toggle">
                                <label for="tos_manual_radio">{translate key=EnterTermsManually}</label>
                            </div>
                            <div class="radio inline-block">
                                <input type="radio" {formname key=TOS_METHOD} value="url"
                                       id="tos_url_radio" data-ref="tos_url_div" class="toggle">
                                <label for="tos_url_radio">{translate key=LinkToTerms}</label>
                            </div>
                            <div class="radio inline-block">
                                <input type="radio" {formname key=TOS_METHOD} value="upload"
                                       id="tos_upload_radio" data-ref="tos_upload_div" class="toggle">
                                <label for="tos_upload_radio">{translate key=UploadTerms}</label>
                            </div>
                        </div>
                        <div id="tos_manual_div" class="tos-div">
                            <div class="form-group">
                                <label for="tos-manual">{translate key=TermsOfService}</label>
                                <textarea id="tos-manual" class="form-control" style="width:100%" rows="10" {formname key=TOS_TEXT}></textarea>
                            </div>
                        </div>
                        <div id="tos_url_div" class="tos-div no-show">
                            <div class="form-group">
                                <label for="tos-url">{translate key=LinkToTerms}</label>
                                <input type="url" id="tos-url" class="form-control"
                                       placeholder="http://www.example.com/tos.html" {formname key=TOS_URL} maxlength="255" />
                            </div>
                        </div>
                        <div id="tos_upload_div" class="tos-div no-show margin-bottom-15">
                            <label for="tos-upload">{translate key=TermsOfService} PDF</label>
                            <div class="dropzone" id="termsOfServiceUpload">
                                <div>
                                    <span class="fa fa-file-pdf-o fa-3x"></span><br/>
                                    {translate key=ChooseOrDropFile}
                                </div>
                                <input id="tos-upload" type="file" {formname key=TOS_UPLOAD}
                                       accept="application/pdf" />
                            </div>
                            <div id="tos-upload-link" class="no-show">
                                <a href="{$ScriptUrl}/uploads/tos/tos.pdf" target="_blank">
                                    <span class="fa fa-file-pdf-o"></span> {translate key=ViewTerms}
                                </a>
                            </div>
                        </div>
                        <div>
                            <div>{translate key=RequireTermsOfServiceAcknowledgement}</div>
                            <div>
                                <div class="radio inline-block">
                                    <input type="radio" {formname key=TOS_APPLICABILITY} value="{TermsOfService::RESERVATION}"
                                           id="tos_reservation"
                                           checked="checked">
                                    <label for="tos_reservation">{translate key=UponReservation}</label>
                                </div>
                                <div class="radio inline-block">
                                    <input type="radio" {formname key=TOS_APPLICABILITY} value="{TermsOfService::REGISTRATION}"
                                           id="tos_registration">
                                    <label for="tos_registration">{translate key=UponRegistration}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        {cancel_button}
                        {delete_button id='deleteTerms' class='no-show'}
                        {update_button submit=true}
                        {indicator}
                    </div>
                </div>
            </form>
        </div>
    </div>

    {include file="javascript-includes.tpl" Qtip=true InlineEdit=true Clear=true}
	{jsfile src="ajax-helpers.js"}
	{jsfile src="admin/reservations.js"}

	{jsfile src="autocomplete.js"}
	{jsfile src="reservationPopup.js"}
	{jsfile src="approval.js"}
    {jsfile src="dropzone.js"}

    <script type="text/javascript">

		function hidePopoversWhenClickAway() {
			$('body').on('click', function (e) {
				$('[rel="popover"]').each(function () {
					if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0)
					{
						$(this).popover('hide');
					}
				});
			});
		}

		function setUpPopovers() {
			$('[rel="popover"]').popover({
				container: 'body', html: true, placement: 'top', content: function () {
					var popoverId = $(this).data('popover-content');
					return $(popoverId).html();
				}
			}).click(function (e) {
				e.preventDefault();
			}).on('show.bs.popover', function () {

			}).on('shown.bs.popover', function () {
				var trigger = $(this);
				var popover = trigger.data('bs.popover').tip();
				popover.find('.editable-cancel').click(function () {
					trigger.popover('hide');
				});
			});
		}

		function setUpEditables() {
			$.fn.editable.defaults.mode = 'popup';
			$.fn.editable.defaults.toggle = 'manual';
			$.fn.editable.defaults.emptyclass = '';
			$.fn.editable.defaults.params = function (params) {
				params.CSRF_TOKEN = $('#csrf_token').val();
				return params;
			};

			var updateUrl = '{$smarty.server.SCRIPT_NAME}?action=';

			$('.inlineAttribute').editable({
				url: updateUrl + '{ManageReservationsActions::UpdateAttribute}', emptytext: '-'
			});
		}

		$(document).ready(function () {

			setUpPopovers();
			hidePopoversWhenClickAway();
			setUpEditables();
            dropzone($("#termsOfServiceUpload"));

			var updateScope = {};
			updateScope['btnUpdateThisInstance'] = '{SeriesUpdateScope::ThisInstance}';
			updateScope['btnUpdateAllInstances'] = '{SeriesUpdateScope::FullSeries}';
			updateScope['btnUpdateFutureInstances'] = '{SeriesUpdateScope::FutureInstances}';

			var actions = {};

			var resOpts = {
				autocompleteUrl: "{$Path}ajax/autocomplete.php?type={AutoCompleteType::User}",
				reservationUrlTemplate: "{$Path}reservation.php?{QueryStringKeys::REFERENCE_NUMBER}=[refnum]",
				popupUrl: "{$Path}ajax/respopup.php",
				updateScope: updateScope,
				actions: actions,
				deleteUrl: '{$Path}ajax/reservation_delete.php?{QueryStringKeys::RESPONSE_TYPE}=json',
				resourceStatusUrl: '{$smarty.server.SCRIPT_NAME}?{QueryStringKeys::ACTION}=changeStatus',
				submitUrl: '{$smarty.server.SCRIPT_NAME}',
                termsOfServiceUrl: '{$smarty.server.SCRIPT_NAME}?dr=tos',
                updateTermsOfServiceAction: 'termsOfService',
                deleteTermsOfServiceAction: 'deleteTerms'
			};

			var approvalOpts = {
				url: '{$Path}ajax/reservation_approve.php'
			};

			var approval = new Approval(approvalOpts);

			var reservationManagement = new ReservationManagement(resOpts, approval);
			reservationManagement.init();

			{foreach from=$reservations item=reservation}

			reservationManagement.addReservation({
				id: '{$reservation->ReservationId}',
				referenceNumber: '{$reservation->ReferenceNumber}',
				isRecurring: '{$reservation->IsRecurring}',
				resourceStatusId: '{$reservation->ResourceStatusId}',
				resourceStatusReasonId: '{$reservation->ResourceStatusReasonId}',
				resourceId: '{$reservation->ResourceId}'
			});
			{/foreach}

			{foreach from=$StatusReasons item=reason}
			reservationManagement.addStatusReason('{$reason->Id()}', '{$reason->StatusId()}', '{$reason->Description()|escape:javascript}');
			{/foreach}

			reservationManagement.initializeStatusFilter('{$ResourceStatusFilterId}', '{$ResourceStatusReasonFilterId}');
		});

		$('#filter-reservations-panel').showHidePanel();

	</script>

	{control type="DatePickerSetupControl" ControlId="startDate" AltId="formattedStartDate"}
	{control type="DatePickerSetupControl" ControlId="endDate" AltId="formattedEndDate"}

	{csrf_token}

	<div id="colorbox">
		<div id="approveDiv" class="wait-box">
			<h3>{translate key=Approving}</h3>
			{html_image src="reservation_submitting.gif"}
		</div>
	</div>

</div>

{include file='globalfooter.tpl'}
