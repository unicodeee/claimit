"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {useRouter} from "next/navigation";
import {app} from "@lib/firebaseConfig";
import {Button} from "@/components/ui/button";


import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"


const auth = getAuth(app);


const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})


export default function MainDashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    alert(values.username);
  }



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
      } else {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2563EB] via-[#9333EA] to-[#4338CA] text-white py-14 px-10 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight">
            Profile Page
          </h1>
          
          <div className="flex gap-4 mt-6">
            <Button
              className="bg-white text-blue-700 font-semibold hover:bg-gray-100"
              onClick={() => router.push("/report-lost")}
            >
              Report Lost Item
            </Button>
            <Button
              variant="secondary"
              className="bg-transparent border border-white hover:bg-white hover:text-blue-700"
              onClick={() => router.push("/browse")}
            >
              Browse Found Items
            </Button>
          </div>
        </div>
        <Image
          src="/hero-people.png"
          alt="Community illustration"
          width={350}
          height={250}
          className="rounded-xl mt-10 md:mt-0 shadow-2xl"
        />
      </section>

      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>

      {/* Quick Actions */}
    

      {/* Recent Lost Items */}
      
    </div>
  );
}
