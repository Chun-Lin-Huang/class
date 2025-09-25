import {Route} from "./abstract/Route";
import { PageRoute } from "./routers/pageRoute";
import { UserRoute } from "./routers/UserRoute";
import { AuthRoute } from "./routers/AuthRoute";
import { AttendanceRoute } from "./routers/AttendanceRoute";
import { CourseRoute } from "./routers/CourseRoute";
import { CourseStudentRoute } from "./routers/CourseStudentRoute";

export const router: Array<Route> = [
    new PageRoute(),
    new UserRoute(),
    new AuthRoute(),
    new AttendanceRoute(),
    new CourseRoute(),
    new CourseStudentRoute()
];

