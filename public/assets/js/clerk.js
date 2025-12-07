async function loadClerk() {
    await Clerk.load();

    if (Clerk.isSignedIn)
        document.getElementById("sign-in").style.display = "none";
    if (!Clerk.isSignedIn) document.getElementById("profile").style.display = "none";
}