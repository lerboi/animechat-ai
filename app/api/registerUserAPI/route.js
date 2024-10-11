import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt"
import { z } from "zod"

const credentialsSchema = z.object({
    email: z.string().email({message: "Not a valid Email"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters long"})
})

export async function POST(req){
    const data = await req.json()
    const {email, password} = data
    
    try{
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if(!existingUser) {
            const validCredential = credentialsSchema.safeParse(data)
    
            if(!validCredential.success){
                const errorMessages = validCredential.error.errors.map(error => error.message)
                return NextResponse.json({error: errorMessages}, {status: 402})
            }
            else{
                const hashedPass = await bcrypt.hash(password, 10)
                const newUser = await prisma.user.create({
                    data: {
                        email: email,
                        password: hashedPass
                    }
                })
                return NextResponse.json({status: 200}, newUser) 
            }
        } else {
            return NextResponse.json({error: "User with that Email already exists"}, {status: 400})
        }
    }
    catch(err){
        console.log("Unexpected Error: " + err)
        return NextResponse.json({error: "Something went wrong"}, {status: 400})
    }
}