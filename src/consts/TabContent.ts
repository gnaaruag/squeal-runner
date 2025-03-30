export const readme_text: string = "-- readme file \n\n-- this is a simple sql editor and runner frontend built on react and vite \n-- the tabs query-one to query-five represent various states the outputs can be displayed\n-- simply click on the file and execute it to see the query output\n\n\n-- the files tab can be toggled to open and closed, the panes are resizable\n-- choice for light and dark mode exist, and can be customized\n-- there is a dropdown that lets you toggle between normal and vim mode\n-- in vim mode you get to use vim bindings in the editor\n\n\n-- you can also export to csv the returned table of your query\n\n-- as required multiple queries are shown for a given table";

export const tab1: string = "-- returns all rows in the `airlogs` table\nSELECT * FROM airlogs;"
export const tab2: string = "-- filters `airlogs` table with `SHS` airport_code\nSELECT * from airlogs WHERE airport_code = \"SHS\";"
export const tab3: string = "-- returns all rows in the `users` table\nSELECT * from users;"
export const tab4: string = "-- filters `users` table with `Sindhi` as language\nSELECT * from users WHERE language = \"Sindhi\";"
export const tab5: string = "-- this is to demonstrate for errors\nSELECT * from ufotable;"
