{assign var=rowCss value='row0'}
{if $reservation->RequiresApproval}{assign var=rowCss value='pending'}{/if}
{if $reservation->IsDeleted}{assign var=rowCss value="deleted"}{/if}
{assign var=reservationId value=$reservation->ReservationId}
<tr class="{$rowCss} {if $IsDesktop}editable{/if}" data-seriesId="{$reservation->SeriesId}" data-refnum="{$reservation->ReferenceNumber}">
  <td class="id hidden">{$reservationId}</td>
  <td class="user">{fullname first=$reservation->FirstName last=$reservation->LastName ignorePrivacy=true}</td>
  <td class="resource">{$reservation->ResourceNames|join:', '}</td>
  <td class="reservationTitle">{$reservation->Title}</td>
  <td class="date">{formatdate date=$reservation->StartDate timezone=$Timezone key=short_reservation_date}</td>
  <td class="date">{formatdate date=$reservation->EndDate timezone=$Timezone key=short_reservation_date}</td>
</tr>
