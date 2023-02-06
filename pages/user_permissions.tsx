import { signIn,signOut,useSession }  from "next-auth/react";
import {useState, useEffect } from 'react'
import { UserDataType } from "./company";

export default function Company() {
    const [data, setData] = useState<UserDataType>()
    const {data: session, status} = useSession();

    useEffect(() => {
        fetch(`${process.env.DJANGO_URL}/user_info/${session!!.user?.email}`)
        .then((res) => res.json())
        .then ((data) => {
            setData(data)
        })
    }, [session?.user])

    if (!data) return <p> No company data</p>

    return (
        <>
        <div>
            <h1>Authentication status: {status}</h1>
            <h2>Username {data.username}</h2>
            <h2>Company: {data.company}</h2>
            <h2>Role: {data.role}</h2>
            {/* Add logic to convert # to role naem */}
            <h2>Company Admin: {data.is_company_admin}</h2>
            {/* <ul>
            {Permissions.map((data) => (
                <li>{data.index}</li>
            ))}

            </ul> */}
            <h2></h2>User Permission: <li>{data.user_permissions}</li>

        </div>

    {status === "authenticated" && session && (
        <>
        Signed in as {session?.user?.email} <br/>
        <button onClick={() => signOut( {callbackUrl: `${process.env.NEXTAUTH_URL}/`})}>Sign out</button>
        </>
    )}
    </>
    )


}

