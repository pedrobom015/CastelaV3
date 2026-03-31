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
Benvolguda / benvolgut:
<br/>
<br/>
Lamentem comunicar-te que la teva petició de reserva ha estat denegada/cancel·lada a causa de :
<br/>
<br/>
<b>{$DeleteReason|nl2br}</b>
<br/>
<br/>
Cordialment,
<br/>
<br/>
Laboratoris Audiovisuals
<br/>
<br/>
-----------------------------------------------------------
<br/>
<br/>
Detalls de la petició:
<br/>
<br/>

Comença: {formatdate date=$StartDate key=reservation_email}<br/>
Finalitza: {formatdate date=$EndDate key=reservation_email}<br/>
{if $ResourceNames|count > 1}
	Recursos demanats:
	<br/>
	{foreach from=$ResourceNames item=resourceName}
		{$resourceName}
		<br/>
	{/foreach}
{else}
	Recurs demanat: {$ResourceName}
	<br/>
{/if}

Títol: {$Title}<br/>
Notes a tenir en compte: {$Description|nl2br}

{if $Attributes|count > 0}
	<br/>
	{foreach from=$Attributes item=attribute}
		<div>{control type="AttributeControl" attribute=$attribute readonly=true}</div>
	{/foreach}
{/if}
