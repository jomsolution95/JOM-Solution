# Script to add default exports to all pages
$pages = @(
    @{Name="Login"; Export="Login"},
    @{Name="Register"; Export="Register"},
    @{Name="Dashboard"; Export="Dashboard"},
    @{Name="Services"; Export="Services"},
    @{Name="Formations"; Export="Formations"},
    @{Name="Jobs"; Export="Jobs"},
    @{Name="Order"; Export="Order"},
    @{Name="Premium"; Export="Premium"},
    @{Name="SocialNetwork"; Export="SocialNetwork"},
    @{Name="UserProfile"; Export="UserProfile"},
    @{Name="About"; Export="About"},
    @{Name="Careers"; Export="Careers"},
    @{Name="Blog"; Export="Blog"},
    @{Name="Partners"; Export="Partners"},
    @{Name="Contact"; Export="Contact"},
    @{Name="Legal"; Export="Legal"},
    @{Name="MyItems"; Export="MyItems"},
    @{Name="MessagesPage"; Export="MessagesPage"},
    @{Name="Billing"; Export="Billing"},
    @{Name="Settings"; Export="Settings"}
)

foreach ($page in $pages) {
    $file = "src\pages\$($page.Name).tsx"
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -notmatch "export default") {
            Add-Content $file "`nexport default $($page.Export);"
            Write-Host "Added default export to $($page.Name).tsx"
        }
    }
}
