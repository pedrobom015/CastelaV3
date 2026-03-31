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
<tr class="{$rowCss}" data-seriesId="{$reservation->SeriesId}" data-refnum="{$reservation->ReferenceNumber}">
  <td colspan="5">
    {if $ReservationAttributes|count > 0}
      <div class="reservation-list-attributes">
        {foreach from=$ReservationAttributes item=attribute}
          {if $attribute->Id() == 7} <!--Delivery - Entrega-->
            {include file='Admin/InlineAttributeEdit.tpl'
            id=$reservation->ReferenceNumber attribute=$attribute
            value=$reservation->Attributes->Get($attribute->Id())
            url="{$smarty.server.SCRIPT_NAME}?action={ManageReservationsActions::UpdateAttribute}"
            }
          {/if}
          {if $attribute->Id() == 8} <!--Return - Devolució-->
            {include file='Admin/InlineAttributeEdit.tpl'
            id=$reservation->ReferenceNumber attribute=$attribute
            value=$reservation->Attributes->Get($attribute->Id())
            url="{$smarty.server.SCRIPT_NAME}?action={ManageReservationsActions::UpdateAttribute}"
            }
          {/if}
          {if $attribute->Id() == 10} <!--Observations - Observacions-->
            {include file='Admin/InlineAttributeEdit.tpl'
            id=$reservation->ReferenceNumber attribute=$attribute
            value=$reservation->Attributes->Get($attribute->Id())
            url="{$smarty.server.SCRIPT_NAME}?action={ManageReservationsActions::UpdateAttribute}"
            }
          {/if}
          {if $attribute->Id() == 4} <!--Incidence - Incidència-->
            {include file='Admin/InlineAttributeEdit.tpl'
            id=$reservation->ReferenceNumber attribute=$attribute
            value=$reservation->Attributes->Get($attribute->Id())
            url="{$smarty.server.SCRIPT_NAME}?action={ManageReservationsActions::UpdateAttribute}"
            }
          {/if}
        {/foreach}
      </div>
    {/if}

  </td>
</tr>
