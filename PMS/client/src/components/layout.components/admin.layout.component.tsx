import { Outlet } from 'react-router'
import Header from './header.component'

export default function AdminLayout() {
    return (
        <div>
            <Header showNavlinks={false} />
            <Outlet />
        </div>
    )
}
