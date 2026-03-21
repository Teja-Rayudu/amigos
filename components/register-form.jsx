"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function RegisterForm({
  className,
  ...props
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[\d\s-]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Account created successfully! Redirecting to login...")
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: ""
        })
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setErrors({ submit: data.error || 'Registration failed' })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error);
      }
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Join AMIGOS</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Create your account to connect & share with friends
        </p>
      </div>
      {/* Success Message */}
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {success}
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errors.submit}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            name="name"
            type="text" 
            placeholder="John Doe" 
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500" : ""}
            disabled={isLoading}
            required 
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-red-500" : ""}
            disabled={isLoading}
            required 
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            name="phone"
            type="tel" 
            placeholder="+91 9876543210" 
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? "border-red-500" : ""}
            disabled={isLoading}
            required 
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          <p className="text-xs text-muted-foreground">Used for Deep Shield OTP verification</p>
        </div>
        
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "border-red-500" : ""}
            disabled={isLoading}
            required 
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        </div>
        
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
          </div>
          <Input 
            id="confirmPassword" 
            name="confirmPassword"
            type="password" 
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "border-red-500" : ""}
            disabled={isLoading}
            required 
          />
          {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
        
        <Button 
          type="submit" 
          className="cursor-pointer w-full text-white bg-indigo-600 hover:bg-indigo-500" 
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/" className="underline underline-offset-4 text-indigo-600">Sign in</Link>
      </div>
    </form>
  );
}
