const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<div className="flex gap-3 pt-2">
                <a
                  href={shopConfig.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-brand-gold transition-colors"
                >
                  Facebook Page
                </a>
                <a
                  href={shopConfig.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-brand-gold transition-colors"
                >
                  YouTube Channel
                </a>
                <a
                  href={shopConfig.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-brand-gold transition-colors"
                >
                  Instagram
                </a>
              </div>`;

const replacement = `<div className="flex gap-4 pt-3">
                {shopConfig.facebookLink && (
                  <a
                    href={shopConfig.facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-stone-850 border border-stone-800 flex items-center justify-center text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {shopConfig.youtubeLink && (
                  <a
                    href={shopConfig.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-stone-850 border border-stone-800 flex items-center justify-center text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {shopConfig.instagramLink && (
                  <a
                    href={shopConfig.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-stone-850 border border-stone-800 flex items-center justify-center text-white hover:bg-[#E4405F] hover:border-[#E4405F] transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {shopConfig.whatsappLink && (
                  <a
                    href={shopConfig.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-stone-850 border border-stone-800 flex items-center justify-center text-white hover:bg-[#25D366] hover:border-[#25D366] transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>`;

const newContent = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', newContent);
console.log("Successfully replaced footer links");
