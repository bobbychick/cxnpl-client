import { signIn,signOut,useSession }  from "next-auth/react";
import Link from 'next/link';

export default function Home() {
  const {data: session, status} = useSession();

  // if (status === "authenticated") {
  //   return <p> Signed in as {session?.user?.email}</p>
  // }
  return (
    <div>
      <p>
      Welcome to the identity management system by CC - Constantiniple Consultants
      </p>

      {status === "authenticated" && session && (
        <>
          Signed in as {session?.user?.email} <br/>
          <button onClick={() => signOut( {callbackUrl: `${process.env.NEXTAUTH_URL}/`})}>Sign out</button>
        </>
      )}
            {status === "unauthenticated"  && !session && (
        <>
          Not signed in<br/>
          {/* <button onClick={() => signIn( 'google', {callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/google`})}>Sign in for master users</button> */}
          <button onClick={() => signIn()}>Sign in for master users</button>
          <button><Link href="login">Click here to login as a user</Link></button>
        </>
       )};
      {/* <h1>
      <button><Link href="/login">Please press this button to sign in</Link></button>
      </h1> */}
      <h1>
      <button><Link href="/company"> View your company</Link></button>
      </h1>
      <button><Link href="/user_permissions">View your permissions here</Link></button>

    </div>
    
  );
}
