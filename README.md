## squeal-runner

a simple, web-based SQL playground capable of running dummy queries and displaying mock results. this project is built using React and Vite and showcases a split editor layout, tabbed interface, dark/light theming, CSV export, an optional vim style editing and basic query simulation.

### overview

- multi tabbed code editor with syntax highlighting and code completion
- a results panel that shows query data or error message and also enables downloading resultant table
- dark and light mode customization
- an optional "vim mode" add on to the code editor

Because this is a dummy application, it doesn’t connect to a real database. Instead, we load and display data from JSON files for certain “queries.”

### frameworks and major dependencies

- react 18
- vite
- code-mirror-v6
- tanstack/react-table
- react-window
- vitejs/plugin-react-swc
- lucide-react

### page load time calculation 

page load times were taken from the network tab in the browser dev tools

- the load times came out to be `256ms` for `DOMContentLoaded` and `353ms` for a complete load.
- these times can be verified from the given screenshot of the devtools

![image](https://github.com/user-attachments/assets/e3a01d11-2687-4297-9a68-915e582837eb)

### performance additions

- to improve overall performance over normal vite builds, i added minification with tersor.
- i have attached the lighthouse performance metrics below
- aria labels are also added for accessibility purposes
- did this for the brownie points: in order to display large amounts of data (17,000+ rows) i utilized virtualization with react-window and tanstack/react-table 

![image](https://github.com/user-attachments/assets/06215e52-d273-4535-9903-29702e5cc4ce)

### application screenshots
![image](https://github.com/user-attachments/assets/32a3a087-7d00-4af8-94c5-a6b775859891)
![image](https://github.com/user-attachments/assets/66546425-5217-4317-a960-5766b4e8db4e)
![image](https://github.com/user-attachments/assets/f62e4627-4f6d-4627-8d3f-e0ee80629f10)
![image](https://github.com/user-attachments/assets/5b045095-cb08-43b8-9fb4-e4e2b435aef0)
![image](https://github.com/user-attachments/assets/2d65cda9-d55e-4dd0-a5c6-f3cf18886f74)
