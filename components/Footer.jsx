import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex mr-4 items-center">
                <Image src="/Winsper-Lands-Investments-Limited-logo.png" alt="winsper" className="md:hidden min-w-[50px]" width={50} height={50}></Image>
              </div>
              <span className="text-2xl font-bold">Winsper Lands</span>
            </div>
            <p className="text-gray-300 mb-6">
              Your trusted partner in finding the perfect property. We make real estate simple and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/about-us" className="hover:text-white">Our Story</Link></li>
              <li><Link href="/about-us" className="hover:text-white">Leadership</Link></li>
              <li><Link href="/about-us" className="hover:text-white">Careers</Link></li>
              <li><Link href="/blogs" className="hover:text-white">News & Media</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span ><Link href="tel:0720108584">0720108584</Link></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="break-all">info@wisperinvestments.co.ke</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Main Office, Ruiru Town New Buiding,<br /> 2rd Floor, Room 206</span>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white">Facebook</a></li>
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><a href="#" className="hover:text-white">Instagram</a></li>
              <li><a href="#" className="hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Havenix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;