### IMPLEMENTATION PLAN

## CHARACTER LIST MVP1 (2-hours)

- write test to view laoding when fething data from api.(tdd: text with loading..)
- once data is fetched show character on ui(tdd: td with name, gender, planet name).
- show pagination like showing a-b of total (tdd: consider first 10 records are fethced of 82 mock data. showing 1-10 of 82 )
- show next / previous button if more recods are there.(tdd: button to be enabled based ondata)
- show show search option on page and filter the records.(tdd : seach by some name we should find that in td ).
- keep page and search on query param so as we need sate by naviating back to this page.
  notes : - the search api response is diffent from pagination. we will transfrom the response.

## CHARACTER LIST MVP2 (2-hours)

- on character page we should be able to click and navite to chacahter detail page.
- on deatil page we should app api and show chacater data( name, palent ,eyes color(tdd: show laoding text. get data and should show on screen under),
- fetch all the films and fitler them to show for this user. (tdd?: films for this user should be in li).
- back button to naviate to characte page.
- show favoirte button to add chacater to favoute list (no api so we will use local storage).

## Favourite List (2 hours)

- create a toggle on chacter list to view favourite charter (load them from local storage)
- we wil use same charater list but now will show option to remove favoutire id the loaced charater is favourite.

## E2E Testing using cypress

- do complete testin fore user behavoiour
