import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";

// -----  Application -----
// Deploy with fly.io ?
// DB with TursoDB and drizzle? bun sqlite?
// Image storage?

// -----   Logistic   -----
// TODO: User sign up (make sure that it is understood that all updates are public to reduce risk of negative impact on adoption.)
// TODO: How are animals ID'd? Does ID just come from the DB?
//       - Make a QR code to share animals? Make sure DB key is sharable? Short link?
// TODO: Profile for user? (Day 2)
// TODO: What is the application flow?
//       - Homepage if logged in
//       - Homepage shows user's past animals by recency/favorites, with a button to report an interaction (top?)
//           - When reporting an interaction, user can either enter an existing animal's ID or fill out a form to create a new animal
//           - Once an interaction has been reported, the animal is attached to the user and the user can post an update on the animal's status
//               - Updates can be posted by clicking on the animal's card and filling out a form (how many updates per animal?) (1)
//               - Animals can have a STATUS (e.g. "In Transit", "With Foster", "Adopted", "Other")
//       - Menu Bar to access 'Profile', 'Settings', etc. ('Explore' to see animals near you?)
//       - Animal Card will show:
//          - Name and breed info
//          - Image (latest image showcased)
//          - Status (e.g. "In Transit", "With Foster", "Adopted", "Other")
//          - Current Foster (the user, if they wish to be public. Otherwise the organization)
//          - Current Organization (e.g. "Almost Home Dog Rescue", "Private", "Other")
//              - Clicking on the organization will show more info about the organization
//              - Organizations will need to sign up to be on the platform
//          - Current Location (click into to show history/map?)
//          - Favorite button
//          - Option to post an update (unknown how)


const app = new Elysia()
  .use(staticPlugin()) // Serve the 'public' folder
  .use(html())
  .get("/", ({ html }) =>
    html(
      <BaseHtml>
        <body
          class="flex w-full h-screen justify-center items-center"
          hx-get="/animals"
          hx-trigger="load"
          hx-swap="innerHTML"
        />
      </BaseHtml>
    )
  )
  .get("/animals", () => <AnimalList animal={db} />)
  .post(
    "/animals/toggle-favorite/:id",
    ({ params }) => {
      const animal = db.find((animal) => animal.id === params.id);
      if (animal) {
        animal.favorite = !animal.favorite;
        return <AnimalItem {...animal} />;
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  // .delete(
  //   "/animals/:id",
  //   ({ params }) => {
  //     const todo = db.find((todo) => todo.id === params.id);
  //     if (todo) {
  //       db.splice(db.indexOf(todo), 1);
  //     }
  //   },
  //   {
  //     params: t.Object({
  //       id: t.Numeric(),
  //     }),
  //   }
  // )
  .post(
    "/claim-animal/:id",
    ({ body }) => {
      // TODO: Validation for animal here, can also be caught by Elysia.
      // (may need to catch  manually to show error message to user)

      // If animal exists, add to user's list of animals
      // Else, add to db
      const newAnimal = {
        id: body.animalId,
        name: body.name,
        image: "",
        location: body.location,
        type: body.type,
        favorite: false,
      };
      db.push(newAnimal);
      console.log(`New Animal Added: ${newAnimal}`);
      return <AnimalItem {...newAnimal} />;
    },
    {
      body: t.Object({
        animalId: t.Numeric({ minLength: 1 }),
        name: t.String({ minLength: 1 }),
        type: t.String({ minLength: 1 }),
        location: t.String({ minLength: 1 }),
      }),
    }
  )
  .listen(3000);

console.log(
  `Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

// TODO: Move this to a separate file
// TODO: Test adding 'hx-boost="true"' to the form
// TODO: Remove CDN if deploying to prod: https://blog.wesleyac.com/posts/why-not-javascript-cdn
const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BETH STACK</title>
  <script src="https://unpkg.com/htmx.org@1.9.5"></script>
  <script src="https://unpkg.com/hyperscript.org@0.9.11"></script> 
  <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
</head>

${children}
`;

// type Todo = {
//   id: number;
//   text: string;
//   completed: boolean;
// };

type Animal = {
  id: number;
  name: string;
  // TODO: images is a list of paths to be displayed as a gallery
  image: string;
  // TODO: location is a list of locations in order of checkins, display as a path?
  location: string;
  type: string;
  favorite: boolean;
};

// const db: Todo[] = [
//   { id: 1, text: "Buy milk", completed: false },
//   { id: 2, text: "Buy eggs", completed: false },
//   { id: 3, text: "Buy bread", completed: false },
// ];

const db: Animal[] = [
  {
    id: 1,
    name: "Louis",
    image: "pitbull.jpg",
    location: "South Carolina",
    type: "Pitbull",
    favorite: true,
  },
  {
    id: 2,
    name: "Tiger",
    image: "labrador.jpg",
    location: "Asia",
    type: "Labrador",
    favorite: true,
  },
  {
    id: 3,
    name: "Penguin",
    image: "parrot.jpg",
    // image: "https://www.w3schools.com/images/picture.jpg",
    location: "Antarctica",
    type: "Parrot",
    favorite: true,
  },
];

// function TodoItem({ text, completed, id }: Todo) {
//   return (
//     <div class="flex flex-row space-x-3">
//       <p>{text}</p>
//       <input
//         type="checkbox"
//         checked={completed}
//         hx-post={`/todos/toggle/${id}`}
//         hx-target="closest div"
//         hx-swap="outerHTML"
//       />
//       <button
//         class="text-red-500"
//         hx-delete={`todos/${id}`}
//         hx-swap="outerHTML"
//         hx-target="closest div"
//       >
//         X
//       </button>
//     </div>
//   );
// }

function AnimalItem({ id, name, location, type, image, favorite }: Animal) {
  return (
    // Gallery of all photos?
    <div class="p-4 bg-gray-100 w-80 mx-auto rounded-lg shadow-md">
      <img
        src={"/public/images/" + image}
        alt={"Image of " + name + ", a " + type + "."}
        class="w-full h-auto rounded-lg"
      />

      <input
        // TODO: make this a heart checkbox (for favorite)
        type="checkbox"
        checked={favorite}
        hx-post={`/todos/toggle/${id}`}
        hx-target="closest div"
        hx-swap="outerHTML"
      />

      <div class="p-4">
        <h2 class="text-xl font-semibold">{name}</h2>
        <p class="text-gray-600">Type: {type}</p>
        <p class="text-gray-600">Current Location: {location}</p>
      </div>

      <button
        hx-get="/api/animal"
        hx-trigger="click"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block mt-4"
      >
        Load More Info
      </button>

      <button
        class="text-red-500"
        hx-delete={`animals/${id}`}
        hx-swap="outerHTML"
        hx-target="closest div"
      >
        Remove from my favorites
      </button>

      <div hx-target="#animal-info" class="mt-4"></div>
    </div>
  );
}

// function TodoList({ todos }: { todos: Todo[] }) {
//   return (
//     <div>
//       {todos.map((todo) => (
//         <TodoItem {...todo} />
//       ))}
//       <TodoForm />
//     </div>
//   );
// }

function AnimalList({ animal }: { animal: Animal[] }) {
  return (
    <div class="flex flex-col gap-4">
      {animal.map((animal) => (
        <AnimalItem {...animal} />
      ))}
      <AnimalClaimForm />
    </div>
  );
}

// function TodoForm() {
//   return (
//     <form
//       class="flex flex-row space-x-3"
//       hx-post="/todos"
//       hx-swap="beforebegin"
//       _="on htmx:afterRequest target.reset()" // hyperscript!
//     >
//       <input type="text" name="content" class="border border-black" />
//       <button type="submit">Add</button>
//     </form>
//   );
// }

function AnimalForm() {
  return (
    <form
      class="flex flex-col space-x-3"
      hx-post="/claim-animal"
      hx-swap="beforebegin"
      _="on htmx:afterRequest target.reset()" // hyperscript!
    >
      <label for="animalId">Animal ID</label>
      <input
        type="text"
        name="animalId"
        placeholder="Animal ID"
        class="border border-black"
      />
      <label for="name">Name</label>
      <input
        type="text"
        name="name"
        placeholder="Name"
        class="border border-black"
      />
      <label for="type">Type</label>
      <input
        type="text"
        name="type"
        placeholder="Type"
        class="border border-black"
      />
      <label for="location">Location</label>
      <input
        type="text"
        name="location"
        placeholder="Location"
        class="border border-black"
      />
      <button type="submit">Claim Animal</button>
    </form>
  );
}

function AnimalClaimForm() {
  // TODO: Add a dropdown for type ??
  // TODO: What does the flow look like for a foster? 
  //  - Claim animal by ID > ID exists > add to foster's list and allow updates
  //  - Claim animal by ID > ID doesn't exist / "I dont have an ID" > redirect to form > add to db and foster's list and allow updates
  return (
    <div class="p-4 max-w-sm mx-auto bg-gray-100 rounded-lg shadow-md">
      <h1 class="text-2xl font-semibold text-center">Report an Interaction</h1>
      <form
        class="mt-4"
        hx-post="/claim-animal"
        hx-swap="beforebegin"
        _="on htmx:afterRequest target.reset()" // hyperscript!
      >
        <div class="mb-4">
          <label for="animalID" class="block mb-1 text-gray-700">
            Animal ID (?)
          </label>
          <input
            type="animalID"
            id="animalID"
            name="animalID"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="<placeholder animal id>"
            required="true"
          />
        </div>
        <div class="text-center">
          <button
            type="submit"
            class="bg-blue-500 text-white font-bold py-2 px-4 rounded inline-block hover:bg-blue-600"
          >
            Report Interaction
          </button>
        </div>
      </form>
    </div>
  );
}

function AnimalCreateForm() {
  // TODO: Add a dropdown for type ??
  // TODO: What does the flow look like for a foster? 
  //  - Claim animal by ID > ID exists > add to foster's list and allow updates
  //  - Claim animal by ID > ID doesn't exist / "I dont have an ID" > redirect to form > add to db and foster's list and allow updates
  return (
    <div class="p-4 max-w-sm mx-auto bg-gray-100 rounded-lg shadow-md">
      <h1 class="text-2xl font-semibold text-center">Report an Interaction</h1>
      <form
        class="mt-4"
        hx-post="/claim-animal"
        hx-swap="beforebegin"
        _="on htmx:afterRequest target.reset()" // hyperscript!
      >
        <div class="mb-4">
          <label for="name" class="block mb-1 text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Buddy"
            required="true"
          />
        </div>
        <div class="mb-4">
          <label for="animalID" class="block mb-1 text-gray-700">
            Animal ID (?)
          </label>
          <input
            type="animalID"
            id="animalID"
            name="animalID"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="<placeholder animal id>"
            required="true"
          />
        </div>
        <div class="mb-4">
          <label for="animalID" class="block mb-1 text-gray-700">
            Type (?)
          </label>
          <input
            type="animalID"
            id="animalID"
            name="animalID"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="<placeholder animal id>"
            required="true"
          />
        </div>
        <div class="mb-6">
          <label for="message" class="block mb-1 text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows="4"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Your message here"
            required="true"
          ></textarea>
        </div>
        <div class="text-center">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
