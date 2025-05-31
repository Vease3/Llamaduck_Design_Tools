# Llamaduck Design Tools

Custom design tools for simple repetitive tasks, built with Next.js and React. This project provides a dashboard interface for accessing various design automation tools to streamline common workflows.

## 🚀 Features

### Available Tools

- **Lottie Token Assigner** - Upload Lottie JSON files and assign design token variable names to colors, making it easier to maintain consistent design systems across animations.

### Coming Soon
- Additional animation tools
- SVG optimization utilities
- Design token management tools

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system variables
- **Icons**: Lucide React
- **Animation**: Lottie libraries (@lottiefiles/lottie-player, lottie-web)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Llamaduck_Design_Tools.git
cd Llamaduck_Design_Tools
```

2. Navigate to the tools app:
```bash
cd tools-app
```

3. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### Lottie Token Assigner

1. Navigate to the Lottie Token Assigner tool from the dashboard
2. Upload a Lottie JSON file by dragging and dropping or clicking to browse
3. The tool will automatically extract all unique colors from the animation
4. Assign variable names to each color for your design token system
5. Click "Add Color Variables" to apply the tokens to the Lottie data
6. Download the updated Lottie file with embedded color variables

This tool is particularly useful for:
- Maintaining design consistency across animations
- Enabling dynamic color theming in Lottie animations
- Preparing animations for design system integration

## 🏗️ Project Structure

```
Llamaduck_Design_Tools/
├── tools-app/                    # Next.js application
│   ├── src/
│   │   └── app/
│   │       ├── components/
│   │       │   ├── animation-tools/    # Animation-related tools
│   │       │   ├── dashboard/          # Dashboard components
│   │       │   └── global/             # Shared UI components
│   │       ├── page.tsx                # Main application entry
│   │       └── layout.tsx              # App layout
│   ├── package.json
│   └── README.md
└── README.md                     # This file
```

## 🎨 Design System

The application follows an 8px grid system and uses:
- Custom CSS variables for theming
- Lucide React for consistent iconography
- Rounded corners and modern UI patterns
- Responsive design principles

## 🚦 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-tool`
3. Make your changes following the existing code style
4. Test your changes thoroughly
5. Submit a pull request

### Adding New Tools

1. Create a new component in the appropriate category folder under `components/`
2. Add the tool to the dashboard configuration in `components/dashboard/DashBoard.tsx`
3. Update the routing logic in `page.tsx`
4. Follow the existing UI patterns and design system

## 📝 License

This project is created for internal use and design workflow optimization.

## 🤝 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

*Built with ❤️ for designers who code and developers who design* 
