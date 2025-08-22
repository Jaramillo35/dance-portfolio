#!/bin/bash

# 🚀 Deploy Dance Portfolio to GitHub Pages
# This script will create a new repository and deploy your website

echo "🎭 Deploying Dance Photography Portfolio to GitHub Pages..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if hub is installed (GitHub CLI)
if ! command -v hub &> /dev/null; then
    echo "⚠️  GitHub CLI (hub) not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install hub
    else
        echo "❌ Please install GitHub CLI manually: https://cli.github.com/"
        exit 1
    fi
fi

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "🎭 Initial commit: Dance Photography Portfolio"
fi

# Create new repository on GitHub
echo "🌐 Creating new repository on GitHub..."
REPO_NAME="dance-portfolio"
REPO_DESC="Dance Photography Portfolio - Martín Jaramillo"

# Create repository using GitHub CLI
hub create -d "$REPO_DESC" -p "$REPO_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Repository created successfully!"
else
    echo "❌ Failed to create repository. Please create it manually on GitHub."
    echo "   Go to: https://github.com/new"
    echo "   Repository name: dance-portfolio"
    echo "   Make it public"
    echo "   Then run: git remote add origin https://github.com/Jaramillo35/dance-portfolio.git"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Create gh-pages branch
echo "🌿 Creating gh-pages branch..."
git checkout -b gh-pages

# Remove everything except dist folder
echo "🧹 Cleaning gh-pages branch..."
git rm -rf src/ public/ package*.json node_modules/ .gitignore README.md DEPLOYMENT.md optimize-photos.js deploy-to-github.sh

# Move dist contents to root
echo "📦 Moving build files..."
mv dist/* .
rmdir dist

# Add all files
git add .
git commit -m "🚀 Deploy to GitHub Pages"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin gh-pages

# Switch back to main branch
git checkout main

# Add remote origin if not exists
if ! git remote get-url origin &> /dev/null; then
    git remote add origin https://github.com/Jaramillo35/dance-portfolio.git
fi

# Push main branch
git push -u origin main

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "🌐 Your website will be available at:"
echo "   https://Jaramillo35.github.io/dance-portfolio"
echo ""
echo "📝 Next steps:"
echo "   1. Go to your repository: https://github.com/Jaramillo35/dance-portfolio"
echo "   2. Go to Settings > Pages"
echo "   3. Source: Deploy from a branch"
echo "   4. Branch: gh-pages"
echo "   5. Wait a few minutes for deployment"
echo ""
echo "🔄 To update your website:"
echo "   1. Make changes to your code"
echo "   2. Run: npm run build"
echo "   3. Run: ./deploy-to-github.sh"
echo ""
echo "✨ Your dance portfolio is now live on GitHub Pages!"
