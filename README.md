<div id="header" align="center">
  <img src="https://media.tenor.com/SkKQMYdLjZIAAAAM/bugs-bunny.gif" width="100"/>
</div>

#        ---------------359 project simioseis---------------

# (1) ADMIN panel
## prosthiki olon ton erotimaton ektos apo!: /// pie-chart: αριθμός public private/events ////
1) dimiourgia admin_dashboard.html gia to dashboard pou tha vlepei mono o admin meso route. To dashboard afto sindeete me:
    1. app.js -> elenxoume an einai odos o admin meso kodiko
    2. app.js -> me get/delete epexergazomaste ta dedomena ton users (kai pio kato bands)
    3. app.js -> alla 2 get gia ta reviews ton xriston (ta pernoume gia na ta dei kai na ta kanei approve o admin) kai gia to pie-chart.
    4. adminLogin.css gia styling ta route dashboard.

2) dimiourgia ksexoristou login logo prosthikis tou admin:
    1. main.js -> ama sto username doume "admin", tote pame sto analogo admin_dashboard.html
    2. main.js -> alios anoigoume apla to JS arxeio me to profile pou borei na epexergasti o kathe xristis gia ton eafto tou.

3) dimiourgia neou arxeiou gia SQL code:
    1. databaseQueriesAdmin.js -> gia deleteUser, getReview kai stats gia to chart.

# (2)
## dimiourgia sxediagramatos gt den eixa ti alo na kanw:
--> sxediagrama.html

# (3)
## ston fakelo bands dimiourgisa 2 nea arxeia (tha valw alla 2 pio meta), gia pio koble login proccess.
1) band_user.hmtl -> omoio me to normal_user.html, apla eikona gia na patiseis ta koubia.
2) band_login -> ilopiisi tou login omoia me to normal_login.html (kapos).
3) 1. .(band_dashboard.html)
   2. .(band_profile.html) tba

# (4) event Γ, bands->done
1) dimiourgia band_dashboard.html (afou exw kanei to login). Ilopiisi tou plires band dashboard:
    1. 2 meries: miso aristera kai dexia. Stin aristeri meria iparxei to calendar parmeno apo to https://fullcalendar.io/ .
    2. band_dashboard.html -> Aristeri meria dashboard: calendar ilopiimeno me id=calendar, etsi oste na paei sto JS script ligo pio kato (mesa sto html arxeio), kai ilopio ta exeis gia to calendar: ena event lister pou periexei to click tis imerominias, tin apothikefsi pliroforias mesa stin imerominia kai add_events gia events pou iparxoun idi stin vasi.
    3. band_dashboard.html -> Dexia meria dashboard: 
        1. Travaei ta aitimata krateisis (requests) apo to backend. An to status einai 'requested', emfanizei koumbi gia Accept/Reject. An ginei accept, to status allazei se 'to be done' kai to event ginetai energo.
        2. Gia ta 'to be done' events, energopoiei ena chat box. H mpanta mporei na antalaksei minimata me ton xristi gia leptomeries. Ta minimata ananeonontai automata kathe 5 defterolepta (polling).
        3. Epitrerpei stin mpanta na markarei ena energo event ws DONE (olokliromeno) gia na kleisei h krateisi kai telos ipologizei kai emfanizei ta synolika esoda tis mpantas apo ta events pou exoun oloklirothei.
    4. band_dashboard.html -> pano dexia kai  kato dexia periexode: ena koubi "edit profile" gia na kanei redirect sto band_profile.html pou borei o xristis na kanei edit to profile tou, kai kato dexia iparxoun ta earnings (aplo block).
    5. band_dash.css ilopiisi diaforetikou arxeiou (css) gia styling me voithia google.
