import { signIn,signOut,useSession }  from "next-auth/react";
import {useState, useEffect } from 'react'
import Link from 'next/link'

export type UserDataType = {
    username:string;
    company:string;
    role:string;
    is_company_admin:boolean;
    user_permissions:string[];
}


export type CompanyDataType = {
    account_funds:string;
    company_readable_id:string;
    owner:string;
    company_name:string;
}

export default function Company() {
    const [companyData, setCompanyData] = useState<CompanyDataType>()
    const [userData, setUserData] = useState<UserDataType>()
    const [companyNameData, setCompanyNameData] = useState<string>()
    const [companyReadableID, setCompanyReadableID] = useState<string>()
    const [owner, setOwner] = useState<string>()
    const [newState, setNewState] = useState(false)

    const {data: session, status} = useSession();
    const [allUserData, setAllUserData] = useState<string[]>()
    const [fetched, setFetched] = useState(false)


    useEffect(() => {
        Promise.all([
            // To Do - Future
            // Move API calls to API folder which will allow for cleaner code and
            // separation of client and api logic
            fetch(`https://cxnpl-server-production.up.railway.app/company/${session?.user?.email}`),
            fetch(`https://cxnpl-server-production.up.railway.app/user_info/${session?.user?.email}`)
            // fetch(`http://127.0.0.1:8000/company/${session?.user?.email}`),
            // fetch(`http://127.0.0.1:8000/user_info/${session?.user?.email}`)
        ])
        .then(([resCompanies, resUsers]) => 
            Promise.all([resCompanies.json(), resUsers.json()])
        )
        .then (([dataCompanies, dataUsers]) => {
            setCompanyData(dataCompanies)
            setUserData(dataUsers)
            setAllUserData(dataCompanies.all_users)
            setOwner(dataUsers.username)
        })
    }, [session?.user,newState])

    const handleDeleteUser = async (currUser:string) => {

        const data = {
            user: currUser,
        }
        const JSONdata = JSON.stringify(data)
        // const endpoint = `http://127.0.0.1:8000/accounts/delete`
        const endpoint = `https://cxnpl-server-production.up.railway.app/accounts/delete`

        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSONdata,
        }

        const response = await fetch(endpoint, options)
        if (response.status === 200) {
            setNewState(true)
        }
        alert("User deleted")
        console.log(response)

    }

    // Handles logic to create a company and assign the creater as the owner
    const handleSubmit = async (event:any) => {
        // Prevents the form from submitting and refreshing the page
        event.preventDefault()

        const data = {
            company_name:companyNameData,
            company_readable_id:companyReadableID,
            owner:owner,
        }
        console.log(data)
        const JSONdata = JSON.stringify(data)

        const endpoint = `https://cxnpl-server-production.up.railway.app/company/create`
        // const endpoint = `http://127.0.0.1:8000/company/create`

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSONdata,
        }

        const response = await fetch(endpoint, options)

        const result = await response.json()
        if (response.status === 200) {
            setNewState(true)
        }
        alert("Company created successfully")

    }

    // Client authorization - If a user is not authorized OR does not belong to a 
    // company, this renders to allow company of creation.
    // Company creation should only be available to master users which should be 
    // implemented server-side. 
    // Users that create a company default to its owner and the user's company is set
    // to the created company

    if (companyData && companyData.company_name === "No Company") return (
        <>
        <p> No company data, fill out this form to create a company:</p>
        <form onSubmit={handleSubmit}>
            <label >Company Name: </label>
            <input value={companyNameData} onChange={(e) => setCompanyNameData(e.target.value)} type="text"/>

            <label>Company ID: </label>
            <input value={companyReadableID} onChange={(e) => setCompanyReadableID(e.target.value)} type="text"/>

            <label>Owner: </label>
            <input defaultValue={userData!!.username} onChange={(e) => setOwner(e.target.value)} type="text"/>
            <button type="submit">Submit</button>
        </form>

        <button><Link href="/">Back to dashboard</Link></button>
        </>
        ) 

    return (
        <>
        <div>
            <h1>Authentication status: {status}</h1>
            <h2>Username {userData?.username}</h2>
            <h2>Company: {userData?.company}</h2>
            <h2>Role: {userData?.role}</h2>
            <h2>Bank funds: {companyData?.account_funds}</h2>

        </div>

    <div>
        {/* Only company owners and admins will be allowed to create a user  */}
        {/* Currently this is client security only, however this should be 
        implemented server-side to improve security */}
        {(userData?.role === "owner" || userData?.role === "company_admin") && session && (
            <Link href="/create_account"><button>Create accounts for employees</button></Link>
        )}

    </div>
    
    {/* Lists out all employees in a users current company. Owners and company administrators
    should be able to delete users */}
    <div>Here is a list of all employees in your organization:
    
        <ul>
            {allUserData?.map((currUser, index) =>(
                <li key = {index}>
                {(userData?.role === "owner" || userData?.role === "company_admin") && session && (
                    <>
                    <label>{currUser}</label>
                    <button onClick={() => handleDeleteUser(currUser)} type="submit">Delete User</button>
                    </>
                )}
                </li>
            ))}
        </ul>

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

