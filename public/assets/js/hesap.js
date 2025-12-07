async function loadClerk() {
    await Clerk.load();

    if (!Clerk.isSignedIn) {
        window.location.href = "/";
    }

    document.getElementById("name").innerHTML = Clerk.user.firstName;

    
    document.getElementById("firstName").value = Clerk.user.firstName;
    document.getElementById("lastName").value = Clerk.user.lastName;

    Clerk.user.emailAddresses.forEach(email => {
        document.getElementById("emails").innerHTML +=
            `<h2>${email.emailAddress}</h2>`;
    });

    document.getElementById("profile-image").src = Clerk.user.imageUrl;
    
    const avatar = document.getElementById("profile-image");
    const filePicker = document.getElementById("filePicker");

    // Resme tıklayınca dosya seçtir
    avatar.onclick = () => {
      filePicker.click();
    };

    // Dosya seçildiğinde Clerk'e yükle
    filePicker.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const user = Clerk.user;
        if (!user) {
          console.warn("Kullanıcı giriş yapmamış.");
          return;
        }

        // Clerk yükleme
        await user.setProfileImage({ file });

        // Yüklenen resmi sayfada hemen göster
        avatar.src = URL.createObjectURL(file);

        console.log("Profil resmi başarıyla güncellendi.");
      } catch (err) {
        console.error("Hata:", err);
      }
    };
}