import AppKit

// Détourage d'un packshot de studio : remplissage par diffusion depuis les
// bords, bande de transition douce pour l'anticrénelage, puis décontamination
// des pixels semi-transparents pour retirer le halo de fond.
// Deux clés, parce qu'aucune ne suffit seule :
//  · "dist"    — écart colorimétrique au fond. Convient quand le produit
//                tranche sur le fond (bande olive ou mauve sur blanc).
//  · "clair"   — luminance signée. Seule issue quand l'ombre portée est PLUS
//                loin du fond que le produit lui-même : une pochette blanche
//                sur gris clair a son ombre à 36 d'écart et son corps à 17,
//                l'écart ne les sépare donc pas. Le signe, lui, les sépare :
//                le produit est plus clair que le fond, l'ombre plus sombre.
// usage : cutout <entrée> <sortie.png> <tolDure> <tolDouce> [dist|clair] [côté]

let args = CommandLine.arguments
guard args.count >= 5,
      let src = NSImage(contentsOfFile: args[1]),
      let tiff = src.tiffRepresentation,
      let inRep = NSBitmapImageRep(data: tiff) else { fatalError("entrée illisible") }
let outPath = args[2]
let tolHard = Double(args[3])!
let tolSoft = Double(args[4])!
let mode = args.count > 5 ? args[5] : "dist"
let outSide = args.count > 6 ? Int(args[6])! : 0
// Ombre portée : elle est PLUS loin du fond que le produit sur un rendu
// clair, l'écart ne la sépare donc pas. Ce qui la sépare, c'est qu'elle est
// grise — sans teinte — là où le produit en a une. On laisse la diffusion
// traverser tout ce qui est neutre et clair.
let ombreLum    = args.count > 7 ? Double(args[7])! : -1   // luminance mini
let ombreChroma = args.count > 8 ? Double(args[8])! : 0    // chroma maxi

let w = inRep.pixelsWide, h = inRep.pixelsHigh
guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8,
                          bytesPerRow: w*4, space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { fatalError() }
ctx.draw(inRep.cgImage!, in: CGRect(x: 0, y: 0, width: w, height: h))
let buf = ctx.data!.bindMemory(to: UInt8.self, capacity: w*h*4)

@inline(__always) func idx(_ x: Int, _ y: Int) -> Int { (y*w + x)*4 }

// Couleur de fond : médiane du liseré de 1 px.
var bs: [[Double]] = [[],[],[]]
for x in 0..<w { for y in [0, h-1] { let i = idx(x,y)
    bs[0].append(Double(buf[i])); bs[1].append(Double(buf[i+1])); bs[2].append(Double(buf[i+2])) } }
for y in 0..<h { for x in [0, w-1] { let i = idx(x,y)
    bs[0].append(Double(buf[i])); bs[1].append(Double(buf[i+1])); bs[2].append(Double(buf[i+2])) } }
let bg = bs.map { c -> Double in let s = c.sorted(); return s[s.count/2] }

@inline(__always) func lum(_ r: Double, _ g: Double, _ b: Double) -> Double {
    r*0.299 + g*0.587 + b*0.114
}
let bgLum = lum(bg[0], bg[1], bg[2])

// Renvoie l'écart AU FOND : 0 = c'est le fond, grand = c'est le produit.
@inline(__always) func dist(_ i: Int) -> Double {
    let r = Double(buf[i]), g = Double(buf[i+1]), b = Double(buf[i+2])
    if mode == "clair" {
        // Tout ce qui est plus sombre que le fond EST du fond (son ombre).
        return max(0, lum(r, g, b) - bgLum)
    }
    let dr = r - bg[0], dg = g - bg[1], db = b - bg[2]
    return (dr*dr + dg*dg + db*db).squareRoot()
}

// Diffusion depuis les bords : on ne traverse que ce qui ressemble au fond.
var alpha = [Double](repeating: 1.0, count: w*h)
var seen  = [Bool](repeating: false, count: w*h)
var queue = [Int](); queue.reserveCapacity(w*h/2)
for x in 0..<w { for y in [0, h-1] { queue.append(y*w+x) } }
for y in 0..<h { for x in [0, w-1] { queue.append(y*w+x) } }
var head = 0
while head < queue.count {
    let p = queue[head]; head += 1
    if seen[p] { continue }
    let x = p % w, y = p / w
    let i0 = idx(x,y)
    let d = dist(i0)
    var estOmbre = false
    if ombreLum >= 0 {
        let r = Double(buf[i0]), g = Double(buf[i0+1]), b = Double(buf[i0+2])
        let chroma = max(r, max(g, b)) - min(r, min(g, b))
        estOmbre = chroma <= ombreChroma && lum(r, g, b) >= ombreLum
    }
    if d > tolSoft && !estOmbre { continue }   // on bute sur le produit
    seen[p] = true
    alpha[p] = (d <= tolHard || estOmbre) ? 0.0 : min(1.0, (d - tolHard) / (tolSoft - tolHard))
    if x > 0     { let q = p-1; if !seen[q] { queue.append(q) } }
    if x < w-1   { let q = p+1; if !seen[q] { queue.append(q) } }
    if y > 0     { let q = p-w; if !seen[q] { queue.append(q) } }
    if y < h-1   { let q = p+w; if !seen[q] { queue.append(q) } }
}

// Écriture : décontamination des pixels partiels, sinon un liseré de fond
// reste collé au contour et se voit sur toute surface plus sombre.
var kept = 0
for p in 0..<(w*h) {
    let a = alpha[p], i = p*4
    if a >= 0.999 { kept += 1; buf[i+3] = 255; continue }
    if a <= 0.001 { buf[i]=0; buf[i+1]=0; buf[i+2]=0; buf[i+3]=0; continue }
    for c in 0..<3 {
        let v = (Double(buf[i+c]) - (1.0-a)*bg[c]) / a
        buf[i+c] = UInt8(max(0, min(255, v.rounded())))
    }
    buf[i+3] = UInt8((a*255).rounded())
    kept += 1
}

guard var cg = ctx.makeImage() else { fatalError("rendu impossible") }
var ow = w, oh = h
if outSide > 0 && outSide < max(w, h) {
    // Réduction dans un contexte prémultiplié : sans lui, le rééchantillonnage
    // mêlerait le noir des pixels transparents au contour et laisserait un
    // liseré sombre sur les bords détourés.
    let k = Double(outSide) / Double(max(w, h))
    ow = Int((Double(w)*k).rounded()); oh = Int((Double(h)*k).rounded())
    guard let sctx = CGContext(data: nil, width: ow, height: oh, bitsPerComponent: 8,
                               bytesPerRow: ow*4, space: CGColorSpaceCreateDeviceRGB(),
                               bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { fatalError() }
    sctx.interpolationQuality = .high
    sctx.draw(cg, in: CGRect(x: 0, y: 0, width: ow, height: oh))
    cg = sctx.makeImage()!
}
let rep = NSBitmapImageRep(cgImage: cg)
rep.size = NSSize(width: ow, height: oh)
guard let png = rep.representation(using: .png, properties: [:]) else { fatalError() }
try! png.write(to: URL(fileURLWithPath: outPath))
let pct = 100.0 * Double(kept) / Double(w*h)
print(String(format: "%@  %dx%d → %dx%d  fond=rgb(%.0f,%.0f,%.0f)  conservé=%.1f%%  → %@",
             (args[1] as NSString).lastPathComponent + " [" + mode + "]", w, h, ow, oh, bg[0], bg[1], bg[2], pct,
             (outPath as NSString).lastPathComponent))
