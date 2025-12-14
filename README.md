# NextJS MAP

## Create an API key for address search control

1. Create an account on https://www.geoapify.com/
2. Create a new "project" on the website
3. Generate an API key on the website (you can use free plan)
4. Use the API key in the application (add it in the .env file, prefixed by "NEXT_PUBLIC\_", to avoid to share it when pushing to github)


#npx kill-port 3000

## SQL

INSERT INTO public.project
("label")
VALUES('PROJET 1');

INSERT INTO public.project_circuit
(project_id, "label", geometry)
VALUES(1, 'CIRCUIT 1', 'POLYGON((50.6373 3.0750,50.6374 3.0750,50.6374 3.0749,50.63 3.07491,50.6373 3.0750))');

## Example NextJS

https://github.com/vercel/next-learn/blob/main/dashboard/final-example
