"""
ProofBench Python Package Setup
For backend proof verification utilities and Pyodide integration
"""

from setuptools import setup, find_packages
import os

# Read README for long description
def read_file(filename):
    with open(os.path.join(os.path.dirname(__file__), filename), encoding='utf-8') as f:
        return f.read()

setup(
    name='proofbench',
    version='3.7.2',
    description='Next-Generation Mathematical Reasoning & Proof Verification System',
    long_description=read_file('README.md') if os.path.exists('README.md') else '',
    long_description_content_type='text/markdown',
    author='Flamehaven',
    author_email='noreply@flamehaven.com',
    url='https://github.com/flamehaven/proofbench',
    license='MIT',

    packages=find_packages(exclude=["frontend", "scripts", "tests*"]),

    python_requires='>=3.8',

    install_requires=[
        'sympy>=1.12',
        'numpy>=1.24.0',
        'pydantic>=2.0.0',
    ],

    extras_require={
        'dev': [
            'pytest>=7.0.0',
            'pytest-cov>=4.0.0',
            'black>=23.0.0',
            'mypy>=1.0.0',
            'ruff>=0.1.0',
        ],
        'web': [
            'fastapi>=0.104.0',
            'uvicorn>=0.24.0',
            'pydantic-settings>=2.0.0',
        ],
    },

    entry_points={
        'console_scripts': [
            'proofbench=proofbench.cli:main',
        ],
    },

    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Science/Research',
        'Intended Audience :: Education',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Topic :: Scientific/Engineering :: Mathematics',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
    ],

    keywords='proof verification mathematics symbolic semantic hybrid reasoning',

    project_urls={
        'Documentation': 'https://proofbench.readthedocs.io',
        'Source': 'https://github.com/flamehaven/proofbench',
        'Tracker': 'https://github.com/flamehaven/proofbench/issues',
    },
)
