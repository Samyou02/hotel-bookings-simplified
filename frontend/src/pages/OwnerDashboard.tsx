import * as React from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, CalendarCheck2, DollarSign } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api"

type OwnerStats = { totalBookings:number; totalRevenue:number; dailyStats:number; roomOccupancy:number; upcomingArrivals: { id:number; hotelId:number; checkIn:string; guests:number }[] }
type Hotel = { id:number; name:string; location:string; status:string; price:number; amenities:string[]; images:string[]; docs:string[] }
type Room = { id:number; hotelId:number; type:string; price:number; availability:boolean; blocked:boolean; amenities:string[]; photos:string[] }
type Booking = { id:number; hotelId:number; checkIn:string; checkOut:string; guests:number; total:number; status:string }
type Review = { id:number; hotelId:number; rating:number; comment:string; createdAt:string; response?:string }

const OwnerDashboard = () => {
  const raw = typeof window !== "undefined" ? localStorage.getItem("auth") : null
  const auth = raw ? JSON.parse(raw) as { user?: { id?: number } } : null
  const ownerId = auth?.user?.id || 0
  const qc = useQueryClient()
  const abKey = "addedByDashboard"
  type AddedStore = { hotels?: number[]; rooms?: number[]; reviews?: number[]; coupons?: number[]; wishlist?: number[] }
  const readAB = (): AddedStore => {
    try { return JSON.parse(localStorage.getItem(abKey) || "{}") as AddedStore } catch { return {} }
  }
  const writeAB = (obj: AddedStore) => { try { localStorage.setItem(abKey, JSON.stringify(obj)); return true } catch (e) { return false } }
  const addId = (type: keyof AddedStore, id: number) => {
    const cur = readAB();
    const list = new Set(cur[type] || []);
    list.add(id);
    cur[type] = Array.from(list);
    writeAB(cur);
  }
  const getSet = (type: keyof AddedStore) => new Set<number>((readAB()[type] || []) as number[])

  const stats = useQuery({ queryKey: ["owner","stats",ownerId], queryFn: () => apiGet<OwnerStats>(`/api/owner/stats?ownerId=${ownerId}`), enabled: !!ownerId })
  const hotelsQ = useQuery({ queryKey: ["owner","hotels",ownerId], queryFn: () => apiGet<{ hotels: Hotel[] }>(`/api/owner/hotels?ownerId=${ownerId}`), enabled: !!ownerId })
  const roomsQ = useQuery({ queryKey: ["owner","rooms",ownerId], queryFn: () => apiGet<{ rooms: Room[] }>(`/api/owner/rooms?ownerId=${ownerId}`), enabled: !!ownerId })
  const bookingsQ = useQuery({ queryKey: ["owner","bookings",ownerId], queryFn: () => apiGet<{ bookings: Booking[] }>(`/api/owner/bookings?ownerId=${ownerId}`), enabled: !!ownerId })
  const reviewsQ = useQuery({ queryKey: ["owner","reviews",ownerId], queryFn: () => apiGet<{ reviews: Review[] }>(`/api/owner/reviews?ownerId=${ownerId}`), enabled: !!ownerId })

  const hotels = (hotelsQ.data?.hotels || []).filter(h => getSet("hotels").has(h.id))
  const rooms = (roomsQ.data?.rooms || []).filter(r => getSet("rooms").has(r.id))
  const bookings = (bookingsQ.data?.bookings || []).filter(b => getSet("rooms").has(b.hotelId))
  const reviews = (reviewsQ.data?.reviews || []).filter(r => getSet("reviews").has(r.id))

  const submitHotel = useMutation({ mutationFn: (p: { name:string; location:string; price:number; amenities:string[] }) => apiPost<{ id:number }, { ownerId:number; name:string; location:string; price:number; amenities:string[] }>(`/api/owner/hotels/submit`, { ownerId, ...p }), onSuccess: (res) => { if (res?.id) addId("hotels", res.id); qc.invalidateQueries({ queryKey: ["owner","hotels",ownerId] }) } })
  const updateAmenities = useMutation({ mutationFn: (p: { id:number; amenities:string[] }) => apiPost(`/api/owner/hotels/${p.id}/amenities`, { amenities: p.amenities }), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","hotels",ownerId] }) })
  const updateImages = useMutation({ mutationFn: (p: { id:number; images:string[] }) => apiPost(`/api/owner/hotels/${p.id}/images`, { images: p.images }), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","hotels",ownerId] }) })
  const updateDocs = useMutation({ mutationFn: (p: { id:number; docs:string[] }) => apiPost(`/api/owner/hotels/${p.id}/docs`, { docs: p.docs }), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","hotels",ownerId] }) })
  const createRoom = useMutation({ mutationFn: (p: { hotelId:number; type:string; price:number; amenities:string[]; photos:string[] }) => apiPost<{ id:number }, { ownerId:number; hotelId:number; type:string; price:number; amenities:string[]; photos:string[]; availability:boolean }>(`/api/owner/rooms`, { ownerId, ...p, availability: true }), onSuccess: (res) => { if (res?.id) addId("rooms", res.id); qc.invalidateQueries({ queryKey: ["owner","rooms",ownerId] }) } })
  const updateRoom = useMutation({ mutationFn: (p: { id:number; price?:number; availability?:boolean; amenities?:string[]; photos?:string[] }) => apiPost(`/api/owner/rooms/${p.id}`, p), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","rooms",ownerId] }) })
  const blockRoom = useMutation({ mutationFn: (p: { id:number; blocked:boolean }) => apiPost(`/api/owner/rooms/${p.id}/block`, { blocked: p.blocked }), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","rooms",ownerId] }) })
  const approveBooking = useMutation({ mutationFn: (id:number) => apiPost(`/api/owner/bookings/${id}/approve`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","bookings",ownerId] }) })
  const cancelBooking = useMutation({ mutationFn: (id:number) => apiPost(`/api/owner/bookings/${id}/cancel`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","bookings",ownerId] }) })
  const checkinBooking = useMutation({ mutationFn: (id:number) => apiPost(`/api/owner/bookings/${id}/checkin`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","bookings",ownerId] }) })
  const checkoutBooking = useMutation({ mutationFn: (id:number) => apiPost(`/api/owner/bookings/${id}/checkout`, {}), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","bookings",ownerId] }) })
  const updatePricing = useMutation({ mutationFn: (p: { hotelId:number; weekendPercent?:number; seasonal?:{start:string;end:string;percent:number}[]; specials?:{date:string;price:number}[] }) => apiPost(`/api/owner/pricing/${p.hotelId}`, p), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","hotels",ownerId] }) })
  const respondReview = useMutation({ mutationFn: (p: { id:number; response:string }) => apiPost(`/api/owner/reviews/${p.id}/respond`, { response: p.response }), onSuccess: () => qc.invalidateQueries({ queryKey: ["owner","reviews",ownerId] }) })

  const [hotelForm, setHotelForm] = React.useState({ name:"", location:"", price:0, amenities:"" })
  const [amenitiesEdit, setAmenitiesEdit] = React.useState<{ [id:number]: string }>({})
  const [imageEdit, setImageEdit] = React.useState<{ [id:number]: string }>({})
  const [docEdit, setDocEdit] = React.useState<{ [id:number]: string }>({})
  const [roomForm, setRoomForm] = React.useState({ hotelId:0, type:"Standard", price:0, amenities:"", photos:"" })
  const [pricingForm, setPricingForm] = React.useState<{ [id:number]: { weekendPercent:string; seasonalStart:string; seasonalEnd:string; seasonalPercent:string; specialDate:string; specialPrice:string } }>({})
  const [reviewReply, setReviewReply] = React.useState<{ [id:number]: string }>({})

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-hero-gradient text-primary-foreground py-10">
          <div className="container">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">Hotel Owner Dashboard</h1>
            </div>
            <p className="opacity-90">Manage your properties and reservations</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <Card className="shadow-card hover:shadow-card-hover transition-all"><CardHeader className="pb-2"><CardTitle className="text-sm">Total Bookings</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.data?.totalBookings ?? 0}</div></CardContent></Card>
              <Card className="shadow-card hover:shadow-card-hover transition-all"><CardHeader className="pb-2"><CardTitle className="text-sm">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">${stats.data?.totalRevenue ?? 0}</div></CardContent></Card>
              <Card className="shadow-card hover:shadow-card-hover transition-all"><CardHeader className="pb-2"><CardTitle className="text-sm">Daily Stats</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.data?.dailyStats ?? 0}</div></CardContent></Card>
              <Card className="shadow-card hover:shadow-card-hover transition-all"><CardHeader className="pb-2"><CardTitle className="text-sm">Room Occupancy</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.data?.roomOccupancy ?? 0}%</div></CardContent></Card>
              <Card className="shadow-card hover:shadow-card-hover transition-all"><CardHeader className="pb-2"><CardTitle className="text-sm">Upcoming Arrivals</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.data?.upcomingArrivals?.length ?? 0}</div></CardContent></Card>
            </div>
          </div>
        </section>
        <div className="container py-8 space-y-8">

        

        <Card className="shadow-card hover:shadow-card-hover transition-all">
          <CardHeader><CardTitle>Hotel Registration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Hotel Name" value={hotelForm.name} onChange={e=>setHotelForm({...hotelForm,name:e.target.value})} />
              <Input placeholder="Location" value={hotelForm.location} onChange={e=>setHotelForm({...hotelForm,location:e.target.value})} />
              <Input type="number" placeholder="Base Price" value={hotelForm.price} onChange={e=>setHotelForm({...hotelForm,price:Number(e.target.value)})} />
              <Input className="col-span-3" placeholder="Amenities (comma-separated)" value={hotelForm.amenities} onChange={e=>setHotelForm({...hotelForm,amenities:e.target.value})} />
            </div>
            <Button onClick={()=>submitHotel.mutate({ name:hotelForm.name, location:hotelForm.location, price:hotelForm.price, amenities: hotelForm.amenities.split(',').map(s=>s.trim()).filter(Boolean) })} disabled={!hotelForm.name || !hotelForm.location}>Submit Hotel</Button>
            <div className="rounded-lg border overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Name</th><th className="p-3">Location</th><th className="p-3">Status</th><th className="p-3">Amenities</th><th className="p-3">Images</th><th className="p-3">Documents</th></tr></thead>
                <tbody className="[&_tr:hover]:bg-muted/30">
                  {hotels.map(h=>(
                    <tr key={h.id} className="border-t align-top">
                      <td className="p-3">{h.name}</td>
                      <td className="p-3">{h.location}</td>
                      <td className="p-3"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${h.status === 'approved' ? 'bg-primary/15 text-primary' : h.status === 'rejected' ? 'bg-destructive/15 text-destructive' : h.status === 'suspended' ? 'bg-accent/15 text-foreground' : 'bg-muted text-foreground'}`}>{h.status}</span></td>
                      <td className="p-2">
                        <div className="flex gap-2 flex-wrap">{h.amenities?.map(a=>(<span key={a} className="px-2 py-1 bg-secondary rounded text-xs">{a}</span>))}</div>
                        <div className="flex gap-2 mt-2">
                          <Input placeholder="amenities" value={amenitiesEdit[h.id]||""} onChange={e=>setAmenitiesEdit({...amenitiesEdit,[h.id]:e.target.value})} />
                          <Button onClick={()=>updateAmenities.mutate({ id:h.id, amenities:(amenitiesEdit[h.id]||"").split(',').map(s=>s.trim()).filter(Boolean) })}>Save</Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 flex-wrap">{h.images?.map(url=>(<span key={url} className="px-2 py-1 bg-secondary rounded text-xs">{url}</span>))}</div>
                        <div className="flex gap-2 mt-2">
                          <Input placeholder="image url(s) comma-separated" value={imageEdit[h.id]||""} onChange={e=>setImageEdit({...imageEdit,[h.id]:e.target.value})} />
                          <Button onClick={()=>updateImages.mutate({ id:h.id, images:(imageEdit[h.id]||"").split(',').map(s=>s.trim()).filter(Boolean) })}>Upload</Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 flex-wrap">{h.docs?.map(url=>(<span key={url} className="px-2 py-1 bg-secondary rounded text-xs">{url}</span>))}</div>
                        <div className="flex gap-2 mt-2">
                          <Input placeholder="doc url(s)" value={docEdit[h.id]||""} onChange={e=>setDocEdit({...docEdit,[h.id]:e.target.value})} />
                          <Button onClick={()=>updateDocs.mutate({ id:h.id, docs:(docEdit[h.id]||"").split(',').map(s=>s.trim()).filter(Boolean) })}>Upload</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-all">
          <CardHeader><CardTitle>Manage Rooms</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <Input type="number" placeholder="Hotel ID" value={roomForm.hotelId} onChange={e=>setRoomForm({...roomForm,hotelId:Number(e.target.value)})} />
              <Input placeholder="Room Type" value={roomForm.type} onChange={e=>setRoomForm({...roomForm,type:e.target.value})} />
              <Input type="number" placeholder="Price" value={roomForm.price} onChange={e=>setRoomForm({...roomForm,price:Number(e.target.value)})} />
              <Input placeholder="Amenities" value={roomForm.amenities} onChange={e=>setRoomForm({...roomForm,amenities:e.target.value})} />
              <Input placeholder="Photo URLs" value={roomForm.photos} onChange={e=>setRoomForm({...roomForm,photos:e.target.value})} />
            </div>
            <Button onClick={()=>createRoom.mutate({ hotelId:roomForm.hotelId, type:roomForm.type, price:roomForm.price, amenities: roomForm.amenities.split(',').map(s=>s.trim()).filter(Boolean), photos: roomForm.photos.split(',').map(s=>s.trim()).filter(Boolean) })} disabled={!roomForm.hotelId || !roomForm.type}>Add Room</Button>
            <div className="rounded-lg border overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Hotel</th><th className="p-3">Type</th><th className="p-3">Price</th><th className="p-3">Availability</th><th className="p-3">Blocked</th><th className="p-3">Actions</th></tr></thead>
                <tbody className="[&_tr:hover]:bg-muted/30">
                  {rooms.map(r=>(
                    <tr key={r.id} className="border-t">
                      <td className="p-3">{r.hotelId}</td>
                      <td className="p-3">{r.type}</td>
                      <td className="p-3">${r.price}</td>
                      <td className="p-3"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${r.availability ? 'bg-primary/15 text-primary' : 'bg-muted text-foreground'}`}>{r.availability ? 'Available' : 'Unavailable'}</span></td>
                      <td className="p-3"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${r.blocked ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'}`}>{r.blocked ? 'Blocked' : 'Free'}</span></td>
                      <td className="p-3 flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={()=>updateRoom.mutate({ id:r.id, availability: !r.availability })}>{r.availability ? 'Set Unavailable' : 'Set Available'}</Button>
                        <Button size="sm" onClick={()=>blockRoom.mutate({ id:r.id, blocked: !r.blocked })}>{r.blocked ? 'Unblock' : 'Block'}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-all">
          <CardHeader><CardTitle>Manage Bookings</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Booking</th><th className="p-3">Hotel</th><th className="p-3">Dates</th><th className="p-3">Guests</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
                <tbody className="[&_tr:hover]:bg-muted/30">
                  {bookings.map(b=>(
                    <tr key={b.id} className="border-t">
                      <td className="p-3">#{b.id}</td>
                      <td className="p-3">{b.hotelId}</td>
                      <td className="p-3">{b.checkIn} → {b.checkOut}</td>
                      <td className="p-3">{b.guests}</td>
                      <td className="p-3">${b.total}</td>
                      <td className="p-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary">{b.status}</span></td>
                      <td className="p-3 flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={()=>approveBooking.mutate(b.id)}>Approve</Button>
                        <Button size="sm" onClick={()=>checkinBooking.mutate(b.id)}>Check-in</Button>
                        <Button size="sm" variant="outline" onClick={()=>checkoutBooking.mutate(b.id)}>Check-out</Button>
                        <Button size="sm" variant="destructive" onClick={()=>cancelBooking.mutate(b.id)}>Cancel</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-all">
          <CardHeader><CardTitle>Dynamic Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left"><th className="p-2">Hotel</th><th className="p-2">Weekend %</th><th className="p-2">Seasonal</th><th className="p-2">Special</th><th className="p-2">Actions</th></tr></thead>
                <tbody>
                  {hotels.map(h=>{
                    const pf = pricingForm[h.id]||{ weekendPercent:"", seasonalStart:"", seasonalEnd:"", seasonalPercent:"", specialDate:"", specialPrice:"" }
                    return (
                      <tr key={h.id} className="border-t">
                        <td className="p-2">{h.id} • {h.name}</td>
                        <td className="p-2"><Input placeholder="%" value={pf.weekendPercent} onChange={e=>setPricingForm({ ...pricingForm, [h.id]: { ...pf, weekendPercent: e.target.value } })} /></td>
                        <td className="p-2">
                          <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Start" value={pf.seasonalStart} onChange={e=>setPricingForm({ ...pricingForm, [h.id]: { ...pf, seasonalStart: e.target.value } })} />
                            <Input placeholder="End" value={pf.seasonalEnd} onChange={e=>setPricingForm({ ...pricingForm, [h.id]: { ...pf, seasonalEnd: e.target.value } })} />
                            <Input placeholder="%" value={pf.seasonalPercent} onChange={e=>setPricingForm({ ...pricingForm, [h.id]: { ...pf, seasonalPercent: e.target.value } })} />
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Date" value={pf.specialDate} onChange={e=>setPricingForm({ ...pricingForm, [h.id]: { ...pf, specialDate: e.target.value } })} />
                            <Input placeholder="Price" value={pf.specialPrice} onChange={e=>setPricingForm({ ...pricingForm, [h.id]: { ...pf, specialPrice: e.target.value } })} />
                          </div>
                        </td>
                        <td className="p-2">
                          <Button onClick={()=>updatePricing.mutate({ hotelId: h.id, weekendPercent: pf.weekendPercent ? Number(pf.weekendPercent) : undefined, seasonal: (pf.seasonalStart && pf.seasonalEnd && pf.seasonalPercent) ? [{ start: pf.seasonalStart, end: pf.seasonalEnd, percent: Number(pf.seasonalPercent) }] : undefined, specials: (pf.specialDate && pf.specialPrice) ? [{ date: pf.specialDate, price: Number(pf.specialPrice) }] : undefined })}>Save</Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-all">
          <CardHeader><CardTitle>Review Management</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviews.map(r=>(
                <div key={r.id} className="border rounded-lg p-3 bg-card">
                  <div className="text-sm font-medium">Hotel {r.hotelId} • {r.rating}/5</div>
                  <div className="text-sm text-muted-foreground">{r.comment}</div>
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Response" value={reviewReply[r.id]||""} onChange={e=>setReviewReply({ ...reviewReply, [r.id]: e.target.value })} />
                    <Button onClick={()=>respondReview.mutate({ id:r.id, response: reviewReply[r.id]||"" })}>Respond</Button>
                  </div>
                </div>
              ))}
              {reviews.length===0 && <div className="text-sm text-muted-foreground">No reviews yet</div>}
            </div>
          </CardContent>
        </Card>
      </div>
      </main>
      <Footer />
    </div>
  )
}

export default OwnerDashboard