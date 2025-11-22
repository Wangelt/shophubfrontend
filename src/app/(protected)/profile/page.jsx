'use client'
import React, { useEffect, useState } from 'react'
import { getUserProfile, updateUserProfile } from '@/services/userservices'
import { uploadSingleImage } from '@/services/adminservices'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setUser } from '@/store/authSlice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { FieldSet, FieldGroup, Field, FieldTitle, FieldDescription, FieldContent } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ImageUpload'
import Image from 'next/image'

const Profile = () => {
	const [data, setData] = useState(null)
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		avatar: ''
	})
	const [loading, setLoading] = useState(false)
	const [fetching, setFetching] = useState(true)
	const [avatarPreview, setAvatarPreview] = useState(null)
	const [avatarFile, setAvatarFile] = useState(null)
	const [/*unused*/, setRerender] = useState(0)
	const fileInputRef = React.useRef(null)
	const dispatch = useDispatch()

	useEffect(() => {
		const fetchData = async () => {
			try {
				setFetching(true)
				const response = await getUserProfile()
				const user = response.data.user
				setData(user)
				setForm({
					name: user?.name || '',
					email: user?.email || '',
					phone: user?.phone || '',
					avatar: user?.avatar || ''
				})
				dispatch(setUser(user))
				toast.success(response.message || 'Profile fetched successfully')
			} catch (error) {
				toast.error(error?.message || 'Failed to load profile')
			} finally {
				setFetching(false)
			}
		}
		fetchData()
	}, [dispatch])

	const handleChange = (e) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleAvatarPick = (e) => {
		const file = e.target.files?.[0]
		if (!file) return
		// Preview locally
		const reader = new FileReader()
		reader.onloadend = () => {
			setAvatarPreview(reader.result)
		}
		reader.readAsDataURL(file)
		setAvatarFile(file)
		// Force rerender for some browsers when selecting same file name again
		setRerender((p) => p + 1)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			setLoading(true)

			let avatarToSave = form.avatar
			// If user picked a new avatar, upload first
			if (avatarFile) {
				const uploadRes = await uploadSingleImage(avatarFile, 'avatars')
				const uploaded = uploadRes?.data?.image
				if (!uploaded) {
					throw new Error(uploadRes?.message || 'Avatar upload failed')
				}
				avatarToSave = uploaded?.url || uploaded
			}

			const payload = {
				name: form.name,
				phone: form.phone,
				avatar: avatarToSave
			}
			const response = await updateUserProfile(payload)
			const updatedUser = response.data.user
			setData(updatedUser)
			dispatch(setUser(updatedUser))
			toast.success(response.message || 'Profile updated successfully')
			// Clear local avatar staging after successful save
			setAvatarFile(null)
			setAvatarPreview(null)
			setForm((prev) => ({ ...prev, avatar: updatedUser?.avatar || avatarToSave || '' }))
		} catch (error) {
			toast.error(error?.message || 'Failed to update profile')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="w-full px-4 py-8 page-gradient min-h-screen">
			<Card>
				<CardHeader>
					<CardTitle>My Profile</CardTitle>
					<CardDescription>View and update your personal information</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldSet className="gap-5">
							<FieldGroup>
								<Field>
									
									<FieldContent>
										<div className="flex items-center gap-4">
											<div className="overflow-hidden rounded-full border" style={{ width: 96, height: 96 }}>
												<Image
													src={
														avatarPreview ||
														(form.avatar ? form.avatar : '/images/image.png')
													}
													alt="Avatar"
													width={96}
													height={96}
													className="object-cover w-24 h-24"
												/>
											</div>
											<div className="flex items-center gap-2">
												<input
													ref={fileInputRef}
													type="file"
													accept="image/*"
													onChange={handleAvatarPick}
													className="hidden"
													disabled={fetching || loading}
												/>
												<Button
													type="button"
													variant="outline"
													onClick={() => fileInputRef.current?.click()}
													disabled={fetching || loading}
												>
													{loading ? 'Uploading...' : 'Change Image'}
												</Button>
												{avatarPreview && (
													<Button
														type="button"
														variant="ghost"
														onClick={() => {
															setAvatarPreview(null)
															setAvatarFile(null)
															if (fileInputRef.current) fileInputRef.current.value = ''
														}}
														disabled={fetching || loading}
													>
														Reset
													</Button>
												)}
											</div>
										</div>
									</FieldContent>
								</Field>
								<Field>
									<FieldTitle>Name</FieldTitle>
									<FieldContent>
										<Input
											name="name"
											placeholder="Your name"
											value={form.name}
											onChange={handleChange}
											disabled={fetching}
											required
										/>
									</FieldContent>
								</Field>
								<Field>
									<FieldTitle>Email</FieldTitle>
									<FieldDescription>This is your login email and cannot be changed</FieldDescription>
									<FieldContent>
										<Input
											name="email"
											value={form.email}
											disabled
										/>
									</FieldContent>
								</Field>
								<Field>
									<FieldTitle>Phone</FieldTitle>
									<FieldContent>
										<Input
											name="phone"
											type="tel"
											placeholder="Phone number"
											value={form.phone}
											onChange={handleChange}
											disabled={fetching}
										/>
									</FieldContent>
								</Field>
								
							</FieldGroup>
						</FieldSet>
						<CardFooter className="mt-6 flex justify-end gap-3 px-0">
							<Button type="submit" disabled={loading || fetching}>
								{loading ? 'Saving...' : 'Save changes'}
							</Button>
						</CardFooter>
					</form>
				</CardContent>
			</Card>
			{data && (
				<div className="mt-6 text-xs text-muted-foreground">
					Account status: {data?.isActive ? 'Active' : 'Inactive'} • Role: {data?.role}
				</div>
			)}
		</div>
	)
}

export default Profile