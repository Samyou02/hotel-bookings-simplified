import * as React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, CalendarDays, Heart } from "lucide-react"
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
  const abKey = "addedByDashboard"
  type AddedStore = { hotels?: number[]; rooms?: number[]; reviews?: number[]; coupons?: number[]; wishlist?: number[]; bookings?: number[] }
  const readAB = (): AddedStore => { try { return JSON.parse(localStorage.getItem(abKey) || "{}") as AddedStore } catch { return {} } }
  const writeAB = (obj: AddedStore) => { try { localStorage.setItem(abKey, JSON.stringify(obj)); return true } catch (e) { return false } }
  const addId = (type: keyof AddedStore, id: number) => { const cur = readAB(); const list = new Set(cur[type] || []); list.add(id); cur[type] = Array.from(list); writeAB(cur) }
  const getSet = (type: keyof AddedStore) => new Set<number>((readAB()[type] || []) as number[])

  const bookingsQ = useQuery({ queryKey: ["user","bookings",userId], queryFn: () => apiGet<{ bookings: Booking[] }>(`/api/user/bookings?userId=${userId}`), enabled: !!userId })
  const reviewsQ = useQuery({ queryKey: ["user","reviews",userId], queryFn: () => apiGet<{ reviews: Review[] }>(`/api/user/reviews?userId=${userId}`), enabled: !!userId })
  const wishlistQ = useQuery({ queryKey: ["user","wishlist",userId], queryFn: () => apiGet<{ wishlist: WishlistItem[] }>(`/api/user/wishlist?userId=${userId}`), enabled: !!userId })

  const bookings = (bookingsQ.data?.bookings || []).filter(b => getSet("bookings").has(b.id))
  const reviews = (reviewsQ.data?.reviews || []).filter(r => getSet("reviews").has(r.id))
  const wishlist = (wishlistQ.data?.wishlist || []).filter(w => getSet("wishlist").has(w.hotelId))

  const cancelBooking = useMutation({ mutationFn: (id:number) => apiPost(`/api/user/bookings/${id}/cancel`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","bookings",userId] }) })
  const addReview = useMutation({ mutationFn: (p:{ hotelId:number; rating:number; comment:string }) => apiPost<{ id:number }, { userId:number; hotelId:number; rating:number; comment:string }>(`/api/user/reviews`, { userId, ...p }), onSuccess: (res) => { if (res?.id) addId("reviews", res.id); qc.invalidateQueries({ queryKey: ["user","reviews",userId] }) } })
  const updateReview = useMutation({ mutationFn: (p:{ id:number; rating?:number; comment?:string }) => apiPost(`/api/user/reviews/${p.id}`, p), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","reviews",userId] }) })
  const deleteReview = useMutation({ mutationFn: (id:number) => apiDelete(`/api/user/reviews/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","reviews",userId] }) })
  const addWishlist = useMutation({ mutationFn: (hotelId:number) => apiPost(`/api/user/wishlist`, { userId, hotelId }), onSuccess: () => { addId("wishlist", Number(wishlistAdd || 0)); qc.invalidateQueries({ queryKey: ["user","wishlist",userId] }) } })
  const removeWishlist = useMutation({ mutationFn: (hotelId:number) => apiDelete(`/api/user/wishlist/${hotelId}?userId=${userId}`), onSuccess: () => qc.invalidateQueries({ queryKey: ["user","wishlist",userId] }) })

  const [reviewForm, setReviewForm] = React.useState({ hotelId: 0, rating: 5, comment: "" })
  const [wishlistAdd, setWishlistAdd] = React.useState(0)

  

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-hero-gradient text-primary-foreground py-10">
          <div className="container">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">User Dashboard</h1>
            </div>
            <p className="opacity-90">View and manage your bookings</p>
          </div>
        </section>
        <div className="container py-8 space-y-8">

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card hover:shadow-card-hover transition-all">
            <CardHeader><CardTitle>Upcoming Bookings</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Booking</th><th className="p-3">Hotel</th><th className="p-3">Dates</th><th className="p-3">Guests</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
                  <tbody className="[&_tr:hover]:bg-muted/30">
                    {bookings.filter(b => new Date(b.checkIn) >= new Date() && b.status !== 'cancelled').map(b => (
                      <tr key={b.id} className="border-t">
                        <td className="p-3">#{b.id}</td>
                        <td className="p-3">{b.hotelId}</td>
                        <td className="p-3">{b.checkIn} → {b.checkOut}</td>
                        <td className="p-3">{b.guests}</td>
                        <td className="p-3">${b.total}</td>
                        <td className="p-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary">{b.status}</span></td>
                        <td className="p-3 flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => cancelBooking.mutate(b.id)}>Cancel</Button>
                          <Button size="sm" variant="outline" onClick={() => window.open(`/api/user/invoices/${b.id}`, '_blank')}>Invoice</Button>
                        </td>
                      </tr>
                    ))}
                    {bookings.filter(b => new Date(b.checkIn) >= new Date() && b.status !== 'cancelled').length === 0 && <tr><td className="p-3 text-muted-foreground" colSpan={7}>No upcoming bookings</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-all">
            <CardHeader><CardTitle>Past Bookings</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Booking</th><th className="p-3">Hotel</th><th className="p-3">Dates</th><th className="p-3">Guests</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
                  <tbody className="[&_tr:hover]:bg-muted/30">
                    {bookings.filter(b => new Date(b.checkOut) < new Date()).map(b => (
                      <tr key={b.id} className="border-t">
                        <td className="p-3">#{b.id}</td>
                        <td className="p-3">{b.hotelId}</td>
                        <td className="p-3">{b.checkIn} → {b.checkOut}</td>
                        <td className="p-3">{b.guests}</td>
                        <td className="p-3">${b.total}</td>
                        <td className="p-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary">{b.status}</span></td>
                      </tr>
                    ))}
                    {bookings.filter(b => new Date(b.checkOut) < new Date()).length === 0 && <tr><td className="p-3 text-muted-foreground" colSpan={6}>No past bookings</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card hover:shadow-card-hover transition-all">
          <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <Input type="number" placeholder="Hotel ID" value={reviewForm.hotelId} onChange={e=>setReviewForm({ ...reviewForm, hotelId: Number(e.target.value) })} />
              <Input type="number" placeholder="Rating 1-5" value={reviewForm.rating} onChange={e=>setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} />
              <Input className="col-span-3" placeholder="Comment" value={reviewForm.comment} onChange={e=>setReviewForm({ ...reviewForm, comment: e.target.value })} />
            </div>
            <Button onClick={()=>addReview.mutate({ hotelId: reviewForm.hotelId, rating: reviewForm.rating, comment: reviewForm.comment })} disabled={!reviewForm.hotelId || !reviewForm.rating}>Add Review</Button>

            <div className="space-y-3 mt-4">
              {reviews.map(r => (
                <div key={r.id} className="border rounded-lg p-3 bg-card">
                  <div className="text-sm font-medium">Hotel {r.hotelId} • {r.rating}/5</div>
                  <div className="text-sm text-muted-foreground">{r.comment}</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={()=>updateReview.mutate({ id:r.id, rating:r.rating })}>Update</Button>
                    <Button size="sm" variant="destructive" onClick={()=>deleteReview.mutate(r.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {reviews.length===0 && <div className="text-sm text-muted-foreground">No reviews</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-all">
          <CardHeader><CardTitle>Wishlist</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input type="number" placeholder="Hotel ID" value={wishlistAdd} onChange={e=>setWishlistAdd(Number(e.target.value))} />
              <Button onClick={()=>addWishlist.mutate(wishlistAdd)} disabled={!wishlistAdd}>Add to Wishlist</Button>
            </div>
            <div className="rounded-lg border overflow-hidden mt-2">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Hotel</th><th className="p-3">Added</th><th className="p-3">Actions</th></tr></thead>
                <tbody className="[&_tr:hover]:bg-muted/30">
                  {wishlist.map(w => (
                    <tr key={`${w.userId}-${w.hotelId}`} className="border-t">
                      <td className="p-3">{w.hotelId}</td>
                      <td className="p-3">{new Date(w.createdAt).toLocaleString()}</td>
                      <td className="p-3"><Button size="sm" variant="destructive" onClick={()=>removeWishlist.mutate(w.hotelId)}>Remove</Button></td>
                    </tr>
                  ))}
                  {wishlist.length===0 && <tr><td className="p-3 text-muted-foreground" colSpan={3}>No items</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      </main>
      <Footer />
    </div>
  )
}

export default UserDashboard