import { signIn,signOut,useSession }  from "next-auth/react";
import {useState, useEffect } from 'react'
import Link from 'next/link'
import { isTemplateSpan } from "typescript";

export default function Company() {
    const [companyData, setCompanyData] = useState({})
    const [userData, setUserData] = useState({})
    const {data: session, status} = useSession();
    const [allUserData, setAllUserData] = useState()


    useEffect(() => {
        Promise.all([
            // To Do - Future
            // Move API calls to API folder which will allow for cleaner code and
            // separation of client and api logic
            fetch(`http://127.0.0.1:8000/company/${session?.user?.email}`),
            fetch(`http://127.0.0.1:8000/user_info/${session?.user?.email}`)
        ])
        .then(([resCompanies, resUsers]) => 
            Promise.all([resCompanies.json(), resUsers.json()])
        )
        .then (([dataCompanies, dataUsers]) => {
            setCompanyData(dataCompanies)
            setUserData(dataUsers)
            setAllUserData(companyData.all_users)
        })
    }, [session?.user])

    const handleDeleteUser = async (event) => {

        const data = {
            user: event.target.thisUser.value,
        }
        const JSONdata = JSON.stringify(data)
        const endpoint = 'http://127.0.0.1:8000/accounts/delete'

        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSONdata,
        }

    }

    const handleSubmit = async (event) => {
        // Prevents the form from submitting and refreshing the page
        event.preventDefault()

        const data = {
            company_name:event.target.company_name.value,
            company_readable_id:event.target.company_readable_id.value,
            owner:event.target.owner.value,
        }
        console.log(data)
        const JSONdata = JSON.stringify(data)

        const endpoint = 'http://127.0.0.1:8000/company/create'

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSONdata,
        }

        const response = await fetch(endpoint, options)

        const result = await response.json()
        alert("Company created successfully")

    }

    // Client authorization - If a user is not authorized OR does not belong to a 
    // company, this renders to allow company of creation.
    // Company creation should only be available to master users which should be 
    // implemented server-side. 
    // Users that create a company default to its owner and the user's company is set
    // to the created company
    if (companyData.company_name === "No Company") return (
        <>
        <p> No company data, fill out this form to create a company:</p>
        <form onSubmit={handleSubmit}>
            <label htmlFor="company_name">Company Name: </label>
            <input type="text" id="company_name" name="company_name" />

            <label htmlFor="company_readable_id">Company ID: </label>
            <input type="text" id="company_readable_id" name="company_readable_id" />

            <label htmlFor="owner">Owner: </label>
            <input readOnly="readonly" value={userData.username} type="text" id="owner" name="owner" />
            <button type="submit">Submit</button>
        </form>

        <button><Link href="/">Back to dashboard</Link></button>
        </>
        ) 

    return (
        <>
        <div>
            <h1>Authentication status: {status}</h1>
            <h2>Username {userData.username}</h2>
            <h2>Company: {userData.company}</h2>
            <h2>Role: {userData.role}</h2>
            <h2>Bank funds: {companyData.account_funds}</h2>

        </div>

    <div>
        {/* Only company owners and admins will be allowed to create a user  */}
        {/* Currently this is client security only, however this should be 
        implemented server-side to improve security */}
        {(userData.role === "owner" || userData.role === "company_admin") && session && (
            <Link href="/create_account"><button>Create accounts for employees</button></Link>
        )}

    </div>
    
    {/* Lists out all employees in a users current company. Owners and company administrators
    should be able to delete users */}
    <div>Here is a list of all employees in your organization:
        <li>
        
        <ul>
            {allUserData?.map((currUser, index) =>(
                <li key = {index}>
                {(userData.role === "owner" || userData.role === "company_admin") && session && (
                    <form onSubmit={handleDeleteUser}>
                        <label htmlFor="thisUser">{currUser} </label>
                        <button type="submit">Delete User</button>
                    </form>
                )}
                </li>
            ))}
        </ul>;

        </li>
    </div>

    {status === "authenticated" && session && (
        <>
        Signed in as {session?.user?.email} <br/>
        <button onClick={() => signOut( {callbackUrl: 'http://localhost:3000/'})}>Sign out</button>
        </>
    )}
    </>
    )


}

