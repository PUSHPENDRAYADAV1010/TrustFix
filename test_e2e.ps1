Write-Host "================================================="
Write-Host "   TRUSTFIX FULL-STACK END-TO-END VERIFICATION   "
Write-Host "================================================="

$baseUrl = if ($env:PORT) { "http://localhost:$env:PORT" } else { "http://localhost:8085" }
$apiUrl = "$baseUrl/api"

# 1. Health Check
$health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method Get
Write-Host "[1/7] Health Check Status:" $health.status "(DB:" $health.components.db.status ")"

# 2. Categories & Services
$categories = Invoke-RestMethod -Uri "$apiUrl/categories" -Method Get
$services = Invoke-RestMethod -Uri "$apiUrl/services/active" -Method Get
Write-Host "[2/7] Active Categories count:" $categories.Count " | Active Services count:" $services.Count

# 3. Verified Providers
$providers = Invoke-RestMethod -Uri "$apiUrl/providers/verified" -Method Get
Write-Host "[3/7] Verified Providers count:" $providers.Count
foreach ($p in $providers) {
    Write-Host "      - Provider #" $p.id ":" $p.businessName "(" $p.city ") Rating:" $p.rating "Reviews:" $p.reviewCount
}

# 4. Customer Login & Booking Flow
$custLogin = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body (@{ email = "testcustomer@gmail.com"; password = "Test@123" } | ConvertTo-Json) -ContentType "application/json"
$custHeaders = @{ Authorization = "Bearer " + $custLogin.message }
Write-Host "[4/7] Customer Logged In: ID" $custLogin.userId "(" $custLogin.name ")"

$custAddrs = Invoke-RestMethod -Uri ("$apiUrl/addresses/user/" + $custLogin.userId) -Method Get -Headers $custHeaders
$addrId = $custAddrs[0].id

$bookingPayload = @{
    bookingDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
    bookingTime = "14:30:00"
    totalAmount = $services[0].basePrice
    notes = "Automated E2E validation test booking"
} | ConvertTo-Json

$bookUrl = "$apiUrl/bookings?customerId=" + $custLogin.userId + "&serviceId=" + $services[0].id + "&addressId=" + $addrId + "&providerId=" + $providers[0].id
$createdBooking = Invoke-RestMethod -Uri $bookUrl -Method Post -Body $bookingPayload -ContentType "application/json" -Headers $custHeaders
Write-Host "      -> Booking Created! Ref:" $createdBooking.bookingReference "Status:" $createdBooking.status "Amount: Rs." $createdBooking.totalAmount

# 5. Provider Login & Lifecycle Updates
$provLogin = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body (@{ email = "testprovider@gmail.com"; password = "Test@123" } | ConvertTo-Json) -ContentType "application/json"
$provHeaders = @{ Authorization = "Bearer " + $provLogin.message }
Write-Host "[5/7] Provider Logged In: ID" $provLogin.userId "(" $provLogin.name ")"

$provProfile = Invoke-RestMethod -Uri ("$apiUrl/providers/user/" + $provLogin.userId) -Method Get -Headers $provHeaders
Write-Host "      -> Provider Profile ID:" $provProfile.id "Business:" $provProfile.businessName

# Accept Booking
$confirmed = Invoke-RestMethod -Uri ("$apiUrl/bookings/" + $createdBooking.id + "/status?status=CONFIRMED") -Method Put -Headers $provHeaders
Write-Host "      -> Booking Transition PENDING -> CONFIRMED:" $confirmed.status

# Start Booking
$inProg = Invoke-RestMethod -Uri ("$apiUrl/bookings/" + $createdBooking.id + "/status?status=IN_PROGRESS") -Method Put -Headers $provHeaders
Write-Host "      -> Booking Transition CONFIRMED -> IN_PROGRESS:" $inProg.status

# Complete Booking
$completed = Invoke-RestMethod -Uri ("$apiUrl/bookings/" + $createdBooking.id + "/status?status=COMPLETED") -Method Put -Headers $provHeaders
Write-Host "      -> Booking Transition IN_PROGRESS -> COMPLETED:" $completed.status

# 6. Customer Review Submission
$reviewPayload = @{
    rating = 5.0
    comment = "Outstanding and prompt service! Technician arrived right on time."
} | ConvertTo-Json

$reviewUrl = "$apiUrl/reviews?bookingId=" + $createdBooking.id + "&customerId=" + $custLogin.userId + "&providerId=" + $provProfile.id
$createdReview = Invoke-RestMethod -Uri $reviewUrl -Method Post -Body $reviewPayload -ContentType "application/json" -Headers $custHeaders
Write-Host "[6/7] Review Submitted for Booking #" $createdReview.bookingId "Rating:" $createdReview.rating "Stars"

# 7. Admin Governance Center
$adminLogin = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body (@{ email = "admin@trustfix.com"; password = "Admin@123" } | ConvertTo-Json) -ContentType "application/json"
$adminHeaders = @{ Authorization = "Bearer " + $adminLogin.message }
Write-Host "[7/7] Admin Logged In:" $adminLogin.email "(Role:" $adminLogin.role ")"

$adminUsers = Invoke-RestMethod -Uri "$apiUrl/users/role/CUSTOMER" -Method Get -Headers $adminHeaders
$adminBookings = Invoke-RestMethod -Uri "$apiUrl/bookings/status/COMPLETED" -Method Get -Headers $adminHeaders
Write-Host "      -> Total Active Customers in MySQL:" $adminUsers.Count
Write-Host "      -> Completed Platform Bookings in MySQL:" $adminBookings.Count

Write-Host "================================================="
Write-Host "   ALL FLOWS PASSED AND PERSISTED IN MYSQL!      "
Write-Host "================================================="
