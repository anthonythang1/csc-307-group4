# csc-307-group4  :  "Fantastic 4"

## Members:
- Anthony Thang
- Aden Ou
- Connor Wilson
- Ruben Saghian


## Project Vision
The SLO Rental Registry is a recordkeeping software which combines information from city records, tenants, and landlords to provide policy-makers an accurate picture of the housing stock and situation.


## UI Prototyping
| Link | Last Modified |
|------|---------------|
| [Figma](https://www.figma.com/design/IVHi7sR4ydQKpGLsmtU8FR/rrami140-s-team-library?node-id=3311-2&m=dev&t=FuF35y9rf5PA6gQZ-1) | May 11, 2026 |


## Dev Document(s)
- [SRS Document](https://docs.google.com/document/d/1lJ5zHeJ6AnNZs89TWM0NXyAblK9rSlp79nLle-FscsA/edit?usp=sharing)
- [Collaborative Document](https://docs.google.com/document/d/16KtSuRc8W66EhsFaRmkawnPUJ5UftmuBYQQK6qXvPyE/edit?tab=t.0)




# Development Environment Set Up

## Frontend Env
### 1. Installation
  For the Frontend Environment, we used Node.js and npm, a package manager for Node.js packages.If you have it already on your computer, skip this section. Otherwise, please downloand and install Nodejs according to your operating system.
  
### 2. Dependencies

Our project requires depedencies that can be installed using npm.
| Package Name | Install |
|--------------|---------|
| zod | `npm install zod`|
| react-dom | `npm install react-dom` |
| react-router-dom | `npm install react-router-dom` |
| supabase/supabase-js | `npm install supabase/supabase-js` |
| emotion/react | `npm install emotion/react` |
| chakra-ui | `npm install chakra-ui/react` |
| chakra-ui/theme-tools | `npm install chakra-ui-theme-tools` |
| vite | `npm install vite` |


### 3. Starting the Frontend Env
After installing the dependencies, you can run a local frontend with `npm run frontend`

## Backend Env
### 1. Installation
We used Maven and Springboot for our backend, requiring their installation. 
### 2. Dependencies
Dependencies are documented with the source code in the `pom.xml` file. No need for additional installations beyond Springboot.
### 3. Starting the Backend Env
Dependicies are installed AND/OR a local backend is ran with `npm run backend`
