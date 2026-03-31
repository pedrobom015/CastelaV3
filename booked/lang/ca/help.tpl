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
{include file='globalheader.tpl' cssFiles="https://cdn.rawgit.com/afeld/bootstrap-toc/v0.4.1/dist/bootstrap-toc.min.css"}


<div id="page-help">

    <div class="row">
        <div id="toc-div" class="col-sm-3 hidden-xs scrollspy">
            <nav id="toc" role="navigation" data-spy="affix" style="overflow-y: scroll;max-height:80%">
            </nav>
        </div>

        <div id="help" class="col-xs-12 col-sm-9">
            <h1>Ajuda de {$AppTitle}</h1>

            <h2>Com accedir a l’aplicació</h2>
            <p>
                L’adreça electrònica de l’aplicació de reserves dels laboratoris audiovisuals és: </br>
                <b>https://etna.uab.cat/audiovisuals</b>
            </p>
            <p>
                L’accés a l’aplicació es fa amb el NIU i la paraula de pas de cada usuari.
            </p>
            <p>
                Tothom pot accedir-hi per fer consultes de disponibilitat, tant de material i espais com de dates i horaris.
            </p>
            <p>
                Només els <b>productors</b> de cada grup i el <b>professorat autoritzat</b> podran fer peticions.
            </p>

            <h2>Peticions</h2>
            <h3>Recursos</h3>
            <p>
                Un cop heu accedit a l’aplicació, veureu la pàgina des de la que podeu fer peticions de recursos.
            </p>
            <p>
                A l’esquerra de la pàgina us apareixerà una llista dels recursos disponibles. Només podeu demanar els que estan marcats amb una fletxa davant del nom.
            </p>
            <p>Seleccioneu el material/espai que voleu demanar i cliqueu el botó <b>Filtrar</b>.</p>
            <p>A la part dreta us apareixerà un calendari que us mostra el recurs que voleu demanar i les dates i horaris, i si aquest està disponible, reservat o bloquejat.</p>
            <p>
                Si passeu el cursor per sobre del nom del recurs obtindreu informació addicional, què inclou, característiques i altres dades.
            </p>
            <p>
                Llavors podeu buscar el material, la data i l’hora en que voleu fer la petició.
            </p>

            <h3>Fer una petició</h3>
            <p>
                Per fer una petició heu de fer un clic marcant l’interval de temps en que voleu sol·licitar el recurs.
            </p>
                A la pàgina que s’obrirà podreu posar els detalls de la petició:
            <p>
            </p>
                - dia i hora de retorn del material </br>
                - per quina assignatura feu la petició </br>
                - podeu autoritzar a una altre persona a recollir l’equip (introduint el seu NIU) </br>
                - afegir-hi comentaris </br>
            <p>
                Per completar la petició és necessari que poseu el vostre telèfon i que accepteu la normativa
                dels laboratoris audiovisuals i la de protecció de dades. Per fer això heu d’obrir el fitxer
                i després marcar la casella.
            </p>
            <p>
                Un cop <b>creada</b> la petició, aquesta apareixerà en el vostre tauler i en el calendari de peticions
                 de color GROC (pendent d’aprovació), fins que els laboratoris audiovisuals donin la seva
                 aprovació a la petició o aquesta sigui rebutjada.
            </p>
            <h3>Recursos Múltiples</h3>
            <p>Si aneu a <b>Afegir Recursos</b> (dintre del formulari de fer una petició)
              podreu afegir més recursos com a part de la mateixa petició.</p>
            <p>Els recursos addicionals estan subjectes a les mateixes condicions que el recurs
              inicial en quant a durada, autorització de recollida del material, etc. </p>

            <h2>Tauler</h2>
            <p>Al menú de la part superior de la pàgina podeu accedir al vostre <b>Tauler</b>, on tindreu informació de les peticions
              que heu fet i en quin estat es troben</p>
            <p>
              Aquestes peticions apareixeran de diferents colors segons el seu estat.
            </p>
            <p>
              Si són GROGUES, voldrà dir que encara estan pendents d’aprovació.
            </p>
            <p>
              Si són VERDES, voldrà dir que estan aprovades.
            </p>
            <p>
              Si són VERMELLES voldrà dir que han estat rebutjades/cancel·lades.
            </p>

            <h2>Actualitzar una petició</h2>
            <p>Podeu actualitzar o canviar qualsevol reserva que hagueu creat, sempre i
              quan estigui encara pendent d’aprovació.
            </p>
            <p>En cas de fer canvis en reserves ja aprovades, aquestes tornaran a aparèixer com a pendents.
            </p>
            <p>
              Només els tècnics poden actualitzar o canviar una petició un cop superada l’hora de recollida.
            </p>

            <h2>Cancel·lar una petició</h2>
            <p>
              També podeu anul·lar qualsevol petició que tingueu feta, encara que ja estigui aprovada, sempre i quan no hagi estat recollida.
            </p>
            <p>
              Heu de cancel·lar qualsevol reserva que no hagueu de fer efectiva, per tal de facilitar l’accés al recurs a la resta d’usuaris.
            </p>
            <p>
              La reiteració de reserves no utilitzades suposarà sancions.
            </p>

            <h2>Aprovació/Denegació de peticions</h2>
            <p>
              Un cop feta la petició, haureu d’esperar a que els Laboratoris Audiovisuals us l’aprovin o la deneguin.
            </p>
            <p>
              Quan la vostra petició sigui processada rebreu un correu electrònic tant si ha estat aprovada, com si ha estat rebutjada. En aquest segon cas el correu especificarà el motiu pel qual la vostra petició ha estat rebutjada.
            </p>

            <h2>Altres consideracions</h2>
            <p>
              Al menú que veureu a la part superior de la pantalla, a més de les opcions de <b>Tauler</b> i <b>Fer peticions</b> teniu la de <b>El meu compte</b>.
            </p>
            <p>
              En aquest menú podeu canviar les dades del vostre perfil, l’adreça de correu electrònic on rebre les notificacions i gestionar quines notificacions voleu rebre i quines no.
            </p>

            <h2>Important</h2>
            <p>
              Per recollir el material l’usuari que ha fet la reserva o aquell que ha estat autoritzat s’haurà d’identificar amb el seu <b>carnet d’estudiant</b>.
            </p>
            <p>
              No es farà cap entrega de material sense el <b>carnet d’estudiant</b> ni a cap altre usuari que no sigui el titular del carnet.
            </p>
            <p>
              Si la reserva d’un recurs no es fa efectiva a l’hora prevista, aquesta podrà ser anul·lada, si es necessari, per posar-la a disposició d’altres usuaris.
            </p>
            <p>
              L´horari de atenció al públic dels Laboratoris Audiovisuals és de 8:30h a 19h.
            </p>
        </div>
    </div>
</div>
<script src="https://cdn.rawgit.com/afeld/bootstrap-toc/v0.4.1/dist/bootstrap-toc.min.js"></script>
{include file="javascript-includes.tpl"}
<script type="text/javascript">
    $(function () {
        var navSelector = '#toc';
        var $myNav = $(navSelector);
        Toc.init({
            $nav: $myNav,
            $scope: $('#help')
        });

        $('body').scrollspy({
            target: navSelector,
            offset: 50
        });
    });
</script>
{include file='globalfooter.tpl'}
