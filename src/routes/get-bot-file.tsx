import { createFileRoute, Outlet } from '@tanstack/react-router';
export const Route=createFileRoute('/get-bot-file')({component:()=> <Outlet />});