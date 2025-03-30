export const readme_text: string = "-- readme file \n\n-- this is a simple sql editor and runner frontend built on react and vite \n-- the tabs query-one to query-five represent various states the outputs can be displayed\n-- simply click on the file and execute it to see the query output\n\n\n-- the files tab can be toggled to open and closed, the panes are resizable\n-- choice for light and dark mode exist, and can be customized\n-- there is a dropdown that lets you toggle between normal and vim mode\n-- in vim mode you get to use vim bindings in the editor\n\n\n-- you can also export to csv the returned table of your query";

export const tab1: string = "SELECT * FROM airlogs;"
export const tab2: string = "SELECT * from airlogs WHERE airport_code = \"SHS\";"
export const tab3: string = "SELECT * from users;"
export const tab4: string = "SELECT * from users WHERE language = \"Sindhi\";"
export const tab5: string = "SELECT * from ufotable;"
