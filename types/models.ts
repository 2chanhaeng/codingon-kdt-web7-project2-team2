export interface User {
  id: number;
  username: string;
  password: string;
}
export interface Diary {
  id: number;
  title: string;
  content: string;
  user_id: number;
  year: number;
  month: number;
  day: number;
}

export interface Todo {
  id: number;
  content: string;
  year: number;
  month: number;
  day: number;
}

export interface Emotion {
  id: number;
  feel: string;
}

export interface Comment {
  id: number;
  todo_id: number;
  content: string;
  emotion_id: number;
}

export interface Image {
  path: string;
  comment_id: number;
}

