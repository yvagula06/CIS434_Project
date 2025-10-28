# Glass Morphism Quick Reference

## 🎨 Color Classes

### Primary (Sky Blue)
```
bg-primary-50      text-primary-50
bg-primary-100     text-primary-100
bg-primary-200     text-primary-200
bg-primary-300     text-primary-300
bg-primary-400     text-primary-400 ⭐ (Most used)
bg-primary-500     text-primary-500 ⭐ (Brand color)
bg-primary-600     text-primary-600
...
```

### Secondary (Purple)
```
bg-secondary-400   text-secondary-400 ⭐
bg-secondary-500   text-secondary-500 ⭐
bg-secondary-600   text-secondary-600
```

### Accent (Orange)
```
bg-accent-400      text-accent-400
bg-accent-500      text-accent-500 ⭐
bg-accent-600      text-accent-600
```

### Dark (Slate)
```
bg-dark-800        text-dark-800 ⭐ (Background)
bg-dark-900        text-dark-900 ⭐ (Deep background)
```

## 🔮 Glass Utilities

### Basic Glass (Light)
```html
<div class="glass">
  <!-- Semi-transparent white panel with blur -->
</div>
```
- Background: `bg-white/5`
- Backdrop: `backdrop-blur-xl`
- Border: `border border-white/10`

### Glass Dark
```html
<div class="glass-dark">
  <!-- Semi-transparent dark panel with blur -->
</div>
```
- Background: `bg-dark-800/50`
- Backdrop: `backdrop-blur-xl`
- Border: `border border-white/5`

### Enhanced Glass with Hover
```html
<div class="glass hover:glass-dark border border-white/10 hover:border-white/20">
  <!-- Transitions from light to dark glass on hover -->
</div>
```

## 🎭 Button Styles

### Primary Button
```html
<button class="btn-primary">
  Click Me
</button>
```
- Gradient: `from-primary-500 to-primary-600`
- Hover: `from-primary-600 to-primary-700`
- Shadow: `shadow-lg`
- Transform: `hover:scale-105`

### Secondary Button
```html
<button class="btn-secondary">
  Secondary
</button>
```
- Gradient: `from-secondary-500 to-secondary-600`
- Similar effects as primary

### Ghost Button
```html
<button class="btn-ghost">
  Ghost
</button>
```
- Glass background
- Subtle hover effects

### Custom Button with Shimmer
```html
<button class="btn-primary relative overflow-hidden group">
  <div class="absolute inset-0 shimmer opacity-0 group-hover:opacity-20"></div>
  <span class="relative">Shimmer Button</span>
</button>
```

## ✨ Animations

### Fade In
```html
<div class="animate-fade-in">
  <!-- Fades in from opacity 0 to 1 -->
</div>
```
Duration: 0.3s

### Slide Up
```html
<div class="animate-slide-up">
  <!-- Slides up from 10px below -->
</div>
```
Duration: 0.4s

### Scale In
```html
<div class="animate-scale-in">
  <!-- Scales from 0.95 to 1 -->
</div>
```
Duration: 0.3s

### Float (Continuous)
```html
<div class="animate-float">
  <!-- Gentle up/down floating motion -->
</div>
```
Duration: 3s (infinite)

### Pulse Slow
```html
<div class="animate-pulse-slow">
  <!-- Slow pulsing effect -->
</div>
```
Duration: 3s (infinite)

### Shimmer (On Hover)
```html
<div class="group relative overflow-hidden">
  <div class="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100">
    <!-- Moving gradient highlight -->
  </div>
</div>
```

### Staggered Animations
```jsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {item.content}
  </div>
))}
```

## 🎯 Common Patterns

### Glass Card
```html
<div class="glass-dark p-6 rounded-2xl border border-white/10">
  <h3 class="text-lg font-bold text-white mb-2">Card Title</h3>
  <p class="text-gray-400">Card content goes here</p>
</div>
```

### Glass Card with Hover
```html
<div class="glass-dark hover:glass p-6 rounded-2xl border border-white/10 hover:border-primary-500/30 transition-all">
  <!-- Transitions to lighter glass on hover -->
</div>
```

### Avatar Circle
```html
<div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
  <svg class="w-5 h-5 text-white"><!-- icon --></svg>
</div>
```

### Gradient Text
```html
<h1 class="gradient-text text-4xl font-bold">
  Gradient Heading
</h1>
```

### Status Indicator
```html
<div class="flex items-center gap-2 text-sm text-gray-400">
  <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-glow"></div>
  <span>Connected</span>
</div>
```

### Badge
```html
<span class="glass px-3 py-1 rounded-lg text-xs font-medium text-primary-300 border border-primary-500/20">
  Badge Text
</span>
```

### Input Field
```html
<input 
  type="text"
  class="input-field"
  placeholder="Type here..."
/>
```

### Textarea
```html
<textarea 
  class="input-field resize-none custom-scrollbar"
  rows="4"
  placeholder="Type your message..."
></textarea>
```

## 🌈 Gradient Combinations

### Primary → Secondary
```html
<div class="bg-gradient-to-r from-primary-500 to-secondary-500">
  <!-- Sky blue to purple -->
</div>
```

### Primary → Primary (Depth)
```html
<div class="bg-gradient-to-br from-primary-500 to-primary-600">
  <!-- Creates depth with same color -->
</div>
```

### Radial Gradient
```html
<div class="bg-gradient-radial from-primary-500/20 via-transparent to-transparent">
  <!-- Radial glow effect -->
</div>
```

### Gradient Borders
```html
<div class="relative p-6 rounded-2xl">
  <div class="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-20 blur-xl"></div>
  <div class="relative glass-dark p-6 rounded-2xl">
    Content
  </div>
</div>
```

## 🎪 Shadow Effects

### Glow
```html
<div class="shadow-glow">
  <!-- Primary color glow -->
</div>
```

### Large Glow
```html
<div class="shadow-glow-lg">
  <!-- Larger primary glow -->
</div>
```

### Purple Glow
```html
<div class="shadow-purple-glow">
  <!-- Secondary/purple glow -->
</div>
```

### Custom Shadow
```html
<div class="shadow-[0_0_30px_rgba(14,165,233,0.3)]">
  <!-- Custom blue glow -->
</div>
```

## 📐 Layout Patterns

### Sidebar Layout
```html
<div class="flex h-screen">
  <!-- Sidebar -->
  <aside class="w-80 glass-dark border-r border-white/10">
    <!-- Sidebar content -->
  </aside>
  
  <!-- Main Content -->
  <main class="flex-1 flex flex-col">
    <!-- Header -->
    <header class="glass-dark border-b border-white/10">
      <!-- Header content -->
    </header>
    
    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- Main content -->
    </div>
    
    <!-- Footer/Input -->
    <footer class="glass-dark border-t border-white/10">
      <!-- Footer content -->
    </footer>
  </main>
</div>
```

### Centered Card
```html
<div class="min-h-screen flex items-center justify-center p-4">
  <div class="glass-dark p-8 rounded-2xl border border-white/10 max-w-md w-full">
    <!-- Card content -->
  </div>
</div>
```

### Background Orbs
```html
<div class="relative min-h-screen overflow-hidden">
  <!-- Background orbs -->
  <div class="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
  <div class="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style="animation-delay: 1s;"></div>
  
  <!-- Content -->
  <div class="relative z-10">
    <!-- Your content here -->
  </div>
</div>
```

## 🎨 Component Examples

### Message Bubble (User)
```html
<div class="flex justify-end mb-4">
  <div class="flex items-start gap-3 max-w-3xl">
    <div class="glass-dark p-4 rounded-2xl border border-white/10">
      <p class="text-white">User message</p>
    </div>
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow"></div>
  </div>
</div>
```

### Message Bubble (Assistant)
```html
<div class="flex justify-start mb-4">
  <div class="flex items-start gap-3 max-w-3xl">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 shadow-glow flex items-center justify-center">
      <svg class="w-5 h-5 text-white"><!-- AI icon --></svg>
    </div>
    <div class="glass p-4 rounded-2xl border border-white/10">
      <p class="text-white">Assistant message</p>
    </div>
  </div>
</div>
```

### Loading Spinner
```html
<div class="relative w-16 h-16">
  <div class="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-20 animate-pulse"></div>
  <svg class="absolute inset-0 animate-spin h-16 w-16 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
</div>
```

### Feature Card
```html
<div class="glass-dark p-6 rounded-2xl border border-white/10 hover:glass hover:border-primary-500/30 transition-all duration-300 group">
  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
    <svg class="w-6 h-6 text-primary-400"><!-- icon --></svg>
  </div>
  <h3 class="text-lg font-bold text-white mb-2">Feature Title</h3>
  <p class="text-gray-400 text-sm">Feature description goes here</p>
</div>
```

## 🛠️ Utility Tips

### Custom Scrollbar
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.5);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.7);
}
```

### Responsive Breakpoints
```
sm:   640px   @media (min-width: 640px)
md:   768px   @media (min-width: 768px)
lg:   1024px  @media (min-width: 1024px)
xl:   1280px  @media (min-width: 1280px)
2xl:  1536px  @media (min-width: 1536px)
```

### Z-Index Layers
```
Background orbs:     z-0
Main content:        z-10
Sidebar/Header:      z-20
Modals/Dropdowns:    z-30
Tooltips:            z-40
Notifications:       z-50
```

## 🎯 Best Practices

1. **Consistent Glass Usage:**
   - Use `.glass-dark` for panels, sidebars, headers
   - Use `.glass` for cards, dropdowns, tooltips

2. **Animation Timing:**
   - Keep animations under 0.5s for interactions
   - Use longer durations (1-3s) for ambient animations

3. **Color Hierarchy:**
   - Primary: Main actions, links
   - Secondary: Supporting elements, icons
   - Accent: Highlights, warnings
   - Dark: Backgrounds, containers

4. **Gradients:**
   - Use subtle gradients for depth (same color, different shades)
   - Use contrasting gradients for emphasis (primary → secondary)

5. **Shadows:**
   - Use `shadow-glow` for active/focused elements
   - Use `shadow-lg` for elevated elements
   - Combine with gradients for best effect

6. **Accessibility:**
   - Always include focus states
   - Ensure sufficient color contrast (4.5:1 minimum)
   - Add ARIA labels for interactive elements
   - Support keyboard navigation

## 📚 Resources

- Tailwind CSS Docs: https://tailwindcss.com/docs
- Glass Morphism Generator: https://hype4.academy/tools/glassmorphism-generator
- Color Palette: Primary (#0ea5e9), Secondary (#a855f7), Accent (#f97316)
