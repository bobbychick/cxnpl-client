import { signIn,signOut,useSession }  from "next-auth/react";
import {useState, useEffect } from 'react'
import Link from 'next/link'
import { CompanyDataType, UserDataType } from "./company";



export default function Company() {
    const [companyData, setCompanyData] = useState<CompanyDataType>()
    const [userData, setUserData] = useState<UserDataType>()
    const {data: session, status} = useSession();
    const [currRole, setRole] = useState("user")


    useEffect(() => {
        Promise.all([
            // Move API calls to API folder - time permitting 
            fetch(`${process.env.DJANGO_URL}/company/${session?.user?.email}`),
            fetch(`${process.env.DJANGO_URL}/user_info/${session?.user?.email}`)
            // fetch(`http://127.0.0.1:8000/company/${session?.user?.email}`),
            // fetch(`http://127.0.0.1:8000/user_info/${session?.user?.email}`)
        ])
        .then(([resCompanies, resUsers]) => 
            Promise.all([resCompanies.json(), resUsers.json()])
        )
        .then (([dataCompanies, dataUsers]) => {
            setCompanyData(dataCompanies)
            setUserData(dataUsers)
            // console.log(dataCompanies)
            // console.log(dataUsers)
        })
    }, [session?.user?.email])

    const handleSubmit = async (event:any) => {
        // Prevents the form from submitting and refreshing the page
        event.preventDefault()

        const data = {
            username: event.target.username.value,
            password: event.target.password.value,
            password2: event.target.password2.value,
            email: event.target.email.value,
            company: event.target.company.value,
            role: event.target.role.value,
        }
        console.log(data)
        const JSONdata = JSON.stringify(data)

        // const endpoint = `http://127.0.0.1:8000/accounts/register`
        const endpoint = `${process.env.DJANGO_URL}/accounts/register`

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSONdata,
        }
        console.log(data)

        const response = await fetch(endpoint, options)

        const result = await response.json()
        alert("User created succesfully")
    }



    if (userData?.role ==="user") return (<div>
        You are a base user and therefore unable to create other users.
        <Link href="/"><button >Click here to return to dashboard</button></Link>
    </div>)

    return (
        <>
        <div>
            <h1>Create a user account in the company: {userData?.company} for which you are a {userData?.role}</h1>
            <h1>As a company {userData?.role}, you can create:</h1>
            <ul>
            {(userData?.role === "owner" || userData?.role === "company_admin") && session && (
            <div>A user</div>
        
            )}
            <>
            {userData?.role === "owner" && session && (
                <div>An administrator</div>
                )}
                </>
            </ul>

        </div>

        <form onSubmit={handleSubmit} method="post">
            <label htmlFor="first">Username: </label>
            <input type="text" id="username" name="username" />

            <label htmlFor="password">Password: </label>
            <input type="text" id="password" name="password" />
            
            <label htmlFor="confirm password">Confirm Password: </label>
            <input type="text" id="password2" name="password2" />

            <label htmlFor="email">Email Address: </label>
            <input type="text" id="email" name="email" />
            
            <label htmlFor="company">Company (Default): </label>
            <input type="text" id="company_readable_id" name="company" readOnly={true} value={companyData?.company_readable_id}/>

            
            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">User type</label>
            <select value = {currRole} id="role" onChange = {(e) => {
                setRole(e.target.value);
            }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected>Choose a user type</option>
            {(userData?.role === "owner" || userData?.role === "company_admin") && session && (
            <option value="user">User</option>
        
            )}
            {(userData?.role === "owner") && session && (
                <>
                <option value="owner">Owner</option>
                <option value="company_admin">Admin</option>
                </>
        
            )}
            </select>

            <button type="submit">Submit</button>
        </form>


    {status === "authenticated" && session && (
        <>
        Signed in as {session?.user?.email} <br/>
        <button onClick={() => signOut( {callbackUrl: `${process.env.NEXTAUTH_URL}/`})}>Sign out</button>
        </>
    )}
    </>
    )


}

