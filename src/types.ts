import { Obj, Str } from "@cloudflare/itty-router-openapi";

export const Character = {
  name: String,
  title: new Str({ required: false }),
  family: new Str({ required: false }),
  image: String,
  cover: new Str({ required: false }),
};

export const UpdateCharacterType = {
  ...Character,
  name: new Str({ required: false }),
  image: new Str({ required: false }),
  id: Number,
  extras: new Obj(
    {
      editedBy: new Str({ required: false }),
      createdBy: new Str({ required: false }),
    },
    { required: false }
  ),
};

export type Extra = {
  editedBy: string;
  createdBy: string;
};

export interface Character {
  id: number;
  name: string;
  title?: string;
  famlily?: string;
  image: string;
  cover?: string;
}

export interface UpdateCharacterType extends Omit<Character, "name" | "image"> {
  name?: string;
  image?: string;
  extra?: Extra;
}

export type User = {
  username: string;
  password: string;
  contributions: number[];
};
