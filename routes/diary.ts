import { Router } from 'express';

import diary from '@/controller/diary';

const route = Router();
route.get("/", diary.redirectGets);

export default route;
