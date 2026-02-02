export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-6 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm opacity-80">
            © {new Date().getFullYear()} KEC Complaint Portal. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm opacity-80">
            <a href="#" className="hover:opacity-100 hover:underline">Privacy Policy</a>
            <a href="#" className="hover:opacity-100 hover:underline">Terms of Use</a>
            <a href="#" className="hover:opacity-100 hover:underline">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
