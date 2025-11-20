import * as React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiDelete } from "@/lib/api"

type Booking = { id:number; hotelId:number; checkIn:string; checkOut:string; guests:number; total:number; status:string; createdAt:string }
type Review = { id:number; hotelId:number; rating:number; comment:string; createdAt:string }
type WishlistItem = { userId:number; hotelId:number; createdAt:string }

const UserDashboard = () => {
  const raw = typeof window !== "undefined" ? localStorage.getItem("auth") : null
  const auth = raw ? JSON.parse(raw) as { user?: { id?: number } } : null
  const userId = auth?.user?.id || 0
  const qc = useQueryClient()

  const bookings = useQuery({ queryKey: ["user","bookings",userId], queryFn: () => apiGet<{ bookings: Booking[] }>(`/api/user/bookings?userId=${userId}`), enabled: !!userId })
  const reviews = useQuery({ queryKey: ["user","reviews",userId], queryFn: () => apiGet<{ reviews: Review[] }>(`/api/user/reviews?userId=${userId}`), enabled: !!userId })
  const wishlist = useQuery({ queryKey: ["user","wishlist",userId], queryFn: () => apiGet<{ wishlist: WishlistItem[] }>(`/api/user/wishlist?userId=${userId}`), enabled: !!userId })

  const cancelBooking = useMutation({ mutationFn: (id:number) => apiPost(`/api/user/bookings/${id}/cancel`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","bookings",userId] }) })
  const addReview = useMutation({ mutationFn: (p:{ hotelId:number; rating:number; comment:string }) => apiPost(`/api/user/reviews`, { userId, ...p }), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","reviews",userId] }) })
  const updateReview = useMutation({ mutationFn: (p:{ id:number; rating?:number; comment?:string }) => apiPost(`/api/user/reviews/${p.id}`, p), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","reviews",userId] }) })
  const deleteReview = useMutation({ mutationFn: (id:number) => apiDelete(`/api/user/reviews/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","reviews",userId] }) })
  const addWishlist = useMutation({ mutationFn: (hotelId:number) => apiPost(`/api/user/wishlist`, { userId, hotelId }), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","wishlist",userId] }) })
  const removeWishlist = useMutation({ mutationFn: (hotelId:number) => apiDelete(`/api/user/wishlist/${hotelId}?userId=${userId}`), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","wishlist",userId] }) })

  const [reviewForm, setReviewForm] = React.useState({ hotelId: 0, rating: 5, comment: "" })
  const [wishlistAdd, setWishlistAdd] = React.useState(0)

  const upcoming = (bookings.data?.bookings||[]).filter(b => new Date(b.checkIn) >= new Date() && b.status !== 'cancelled')
  const past = (bookings.data?.bookings||[]).filter(b => new Date(b.checkOut) < new Date())

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">User Dashboard</h1>
          <p className="text-muted-foreground">View and manage your bookings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Upcoming Bookings</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left"><th className="p-2">Booking</th><th className="p-2">Hotel</th><th className="p-2">Dates</th><th className="p-2">Guests</th><th className="p-2">Total</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
                  <tbody>
                    {upcoming.map(b => (
                      <tr key={b.id} className="border-t">
                        <td className="p-2">#{b.id}</td>
                        <td className="p-2">{b.hotelId}</td>
                        <td className="p-2">{b.checkIn} → {b.checkOut}</td>
                        <td className="p-2">{b.guests}</td>
                        <td className="p-2">${b.total}</td>
                        <td className="p-2">{b.status}</td>
                        <td className="p-2 flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => cancelBooking.mutate(b.id)}>Cancel</Button>
                          <Button size="sm" variant="outline" onClick={() => window.open(`/api/user/invoices/${b.id}`, '_blank')}>Invoice</Button>
                        </td>
                      </tr>
                    ))}
                    {upcoming.length === 0 && <tr><td className="p-2 text-muted-foreground" colSpan={7}>No upcoming bookings</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Past Bookings</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left"><th className="p-2">Booking</th><th className="p-2">Hotel</th><th className="p-2">Dates</th><th className="p-2">Guests</th><th className="p-2">Total</th><th className="p-2">Status</th></tr></thead>
                  <tbody>
                    {past.map(b => (
                      <tr key={b.id} className="border-t">
                        <td className="p-2">#{b.id}</td>
                        <td className="p-2">{b.hotelId}</td>
                        <td className="p-2">{b.checkIn} → {b.checkOut}</td>
                        <td className="p-2">{b.guests}</td>
                        <td className="p-2">${b.total}</td>
                        <td className="p-2">{b.status}</td>
                      </tr>
                    ))}
                    {past.length === 0 && <tr><td className="p-2 text-muted-foreground" colSpan={6}>No past bookings</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <Input type="number" placeholder="Hotel ID" value={reviewForm.hotelId} onChange={e=>setReviewForm({ ...reviewForm, hotelId: Number(e.target.value) })} />
              <Input type="number" placeholder="Rating 1-5" value={reviewForm.rating} onChange={e=>setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} />
              <Input className="col-span-3" placeholder="Comment" value={reviewForm.comment} onChange={e=>setReviewForm({ ...reviewForm, comment: e.target.value })} />
            </div>
            <Button onClick={()=>addReview.mutate({ hotelId: reviewForm.hotelId, rating: reviewForm.rating, comment: reviewForm.comment })} disabled={!reviewForm.hotelId || !reviewForm.rating}>Add Review</Button>

            <div className="space-y-3 mt-4">
              {(reviews.data?.reviews||[]).map(r => (
                <div key={r.id} className="border rounded p-3">
                  <div className="text-sm font-medium">Hotel {r.hotelId} • {r.rating}/5</div>
                  <div className="text-sm text-muted-foreground">{r.comment}</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={()=>updateReview.mutate({ id:r.id, rating:r.rating })}>Update</Button>
                    <Button size="sm" variant="destructive" onClick={()=>deleteReview.mutate(r.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {(!reviews.data?.reviews || reviews.data.reviews.length===0) && <div className="text-sm text-muted-foreground">No reviews</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Wishlist</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input type="number" placeholder="Hotel ID" value={wishlistAdd} onChange={e=>setWishlistAdd(Number(e.target.value))} />
              <Button onClick={()=>addWishlist.mutate(wishlistAdd)} disabled={!wishlistAdd}>Add to Wishlist</Button>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm">
                <thead><tr className="text-left"><th className="p-2">Hotel</th><th className="p-2">Added</th><th className="p-2">Actions</th></tr></thead>
                <tbody>
                  {(wishlist.data?.wishlist||[]).map(w => (
                    <tr key={`${w.userId}-${w.hotelId}`} className="border-t">
                      <td className="p-2">{w.hotelId}</td>
                      <td className="p-2">{new Date(w.createdAt).toLocaleString()}</td>
                      <td className="p-2"><Button size="sm" variant="destructive" onClick={()=>removeWishlist.mutate(w.hotelId)}>Remove</Button></td>
                    </tr>
                  ))}
                  {(!wishlist.data?.wishlist || wishlist.data.wishlist.length===0) && <tr><td className="p-2 text-muted-foreground" colSpan={3}>No items</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default UserDashboard