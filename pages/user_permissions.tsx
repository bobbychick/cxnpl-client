import { signIn,signOut,useSession }  from "next-auth/react";
import {useState, useEffect } from 'react'
import { UserDataType } from "./company";

export default function Company() {
    const [data, setData] = useState<UserDataType>();
    const {data: session, status} = useSession();
    const [userPermissions, setUserPermissions] = useState<string[]>([]);

    useEffect(() => {
        fetch(`https://cxnpl-server-production.up.railway.app/user_info/${session!!.user?.email}`)
        // fetch(`http://127.0.0.1:8000/user_info/${session!!.user?.email}`)
        .then((res) => res.json())
        .then ((data) => {
            setData(data)
            console.log(data)
            setUserPermissions(data.user_permissions)
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
            <h2>User Permissions:</h2>
            {userPermissions!!.map((permission:string, index:number) =>(
                <li key = {index}>
                    <>
                    <label>{permission}</label>
                    </>
                </li>
            ))}

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

