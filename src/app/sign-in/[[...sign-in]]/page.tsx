import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0c0f] py-12 px-4 sm:px-6 lg:px-8 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white font-serif">
                        Kur'ancılar
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Hesabınıza giriş yapın
                    </p>
                </div>
                <div className="flex justify-center">
                    <SignIn />
                </div>
            </div>
        </div>
    );
}
