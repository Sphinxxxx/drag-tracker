/*
    SCSS -> CSS
    WIP - Goal: Support nesting and variables. Maybe parameterless mixins?
*/
function scss2css(scss)
{
    function splitAndTrim(str, delimiter) {
        const arr = str.split(delimiter).map(s => s.trim());
        return arr;
    }

    let script = '';
    const classStack = [],
          variables = {},
          lines = splitAndTrim(scss, '\n');
          
    let prevLine = '';

    for(let i = 0, c = lines.length; i < c; i++) {
        const line = lines[i];
        //script += '/** $line **/\n';
        if((line === '') || line.startsWith('//')) { continue; }
        
        //Sass variables:
        //  $color-foreground: gold;
        //  $color-background: silver;
        if(line.startsWith('$')) {
            const nameAndValue = splitAndTrim(line, ':'),
                  name = nameAndValue[0],
                  value = splitAndTrim(nameAndValue[1], ';')[0];

            variables[name] = value;
            
            continue;
        }
        
        //Put "Shared" classes (example: .class1,\n .class2,\n .class3 {...) and complex properties on one line:
        while(line.endsWith(',')) {
            line += ' ' + lines[++i];
        }

        const prevClassFinished = prevLine.endsWith('}');
        let l = line;
        if(l.endsWith('{')) {
            let cls = l.slice(0, -1).trim();
            
            if(classStack.length) {
                //Nested class. End the previous class..
                if(!prevClassFinished) {
                    script += '\n}\n';
                }
                //..and create the full class name (also for each "shared" class we collected above, if necessary):
                const parentClass = classStack[classStack.length - 1],
                      shared = splitAndTrim(cls, ',');
                cls = '';
                shared.forEach(s => {
                    //.foo { .bar {...} } vs .foo { &.bar {...} }
                    if(s.startsWith('&')) {
                        s = s.substr(1);
                    }
                    else {
                        s = ' ' + s;
                    }
                    
                    if(cls) { cls += ', '; }
                    cls += parentClass + s;
                });
            }
            
            classStack.push(cls);
            l = cls + ' {';
        }
        else if(l.endsWith('}')) {
            classStack.pop();
            //No need for nested '}'s..
            if(prevClassFinished) { continue; }
            
            l += '\n';
        }
        else {
            //Indent properties within a class:
            if(classStack.length) {
                l = '    ' + l;
            }
        }
        
        prevLine = line;

        if(script) { script += '\n'; }
        script += l;
    }
    
    
    //Replace variables with their values, starting with the longest variable names:
    const varNames = Object.keys(variables);
    varNames.sort((a, b) => b.length - a.length);
    //usort($varNames, function($a, $b) { return (strlen($b) - strlen($a)); });
    
    varNames.forEach(name => {
        //https://stackoverflow.com/a/40562456/1869660
        const nameRegex = new RegExp(name.replace(/(?=\W)/g, '\\'), 'g');
        script = screen.replace(nameRegex, variables[name]);
    });
    
    return script;
}
