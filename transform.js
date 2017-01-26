const Px = require('px');
const fs = require('fs');

function cleanUnitValue(value) {
  if(isCountryValue(value)) return value.replace("Schweiz", "Switzerland");
  if(isCantonValue(value)) return value.substring(2);
  if(isDistrictValue(value)) return value.substring(3);
  if(isCommunityValue(value)) return value.substring(6);
  return "Unkown";
}

function isCommunityVariable(varName) {
  return varName === 'Kanton (-) / Bezirk (>>) / Gemeinde (......)'
}

function isCountryValue(value) {
  return value === 'Schweiz'
}

function isCantonValue(value) {
  return value.startsWith('- ')
}

function isDistrictValue(value) {
  return value.startsWith('>> ')
}

function isCommunityValue(value) {
  return value.startsWith('......')
}

function unitFromValue(value) {
  if(isCountryValue(value)) return "Country";
  if(isCantonValue(value)) return "Canton";
  if(isDistrictValue(value)) return "District";
  if(isCommunityValue(value)) return "Community";
  return "Unkown";
}

function* datumIndizes(valCounts) {
  //NOTE: This seems crazy at first - but by unrolling we avoid the recursion and we have
  //a fixed amount of dimensions anyway
  const dimension = valCounts.length;
  const indizes = [];

	for(var i = 0; i < valCounts[0]; i++) {
    if(dimension === 1) {
      indizes.push([i]);
    }

		for(var j = 0; j < valCounts[1]; j++) {
      if(dimension === 2) {
				indizes.push([i, j]);
        continue;
      }
			for(var k = 0; k < valCounts[2]; k++) {
        if(dimension === 3) {
					indizes.push([i, j, k]);
					continue;
        }
				for(var l = 0; l < valCounts[3]; l++) {
					if(dimension === 4) {
						indizes.push([i, j, k, l]);
						continue;
          }
					for(var m = 0; m < valCounts[4]; m++) {
						if(dimension === 5) {
							indizes.push([i, j, k, l, m]);
							continue;
            }
						for(var n = 0; n < valCounts[5]; n++) {
							if(dimension === 6) {
								indizes.push([i, j, k , l, m, n]);
								continue;
							} else {
                throw "Only at max 6 dimensions supported";
              }
						}
					}
        }
      }
    }
  }

  return indizes;
}

function allDatums(px) {
  const counts = px.valCounts()
  const indizes = datumIndizes(counts);
  const datums = [];
  indizes.forEach(index => {
    const datum = []
    index.forEach((i, j) => {
      datum.push(px.values(j)[i]);
    });
    datum.push(px.datum(index));
    datums.push(datum);
  });
  return datums;
}

fs.readFile('./px-x-0102020000_402.px', 'utf8', function(err, data) {
  if(err) throw err;
  px = new Px(data);
  const meta = px.metadata;
  const vars = px.variables();
  console.log(px.valCounts());


  console.log('Unit', "\t", vars[0], "\t", vars[1], "\t", vars[2], '\t', 'Datum')
  allDatums(px).forEach(datum => {
    console.log(datum);
  });

  const counts = px.valCounts()

	for(var i = 0; i < counts[0]; i++) {
		for(var j = 0; j < counts[1]; j++) {
			for(var k = 0; k < counts[2]; k++) {
				console.log(unitFromValue(px.values(0)[i]), '\t', cleanUnitValue(px.values(0)[i]), '\t', px.values(1)[j], '\t', px.values(2)[k], '\t', px.datum([i, j, k]))
			}
		}
	}


  const values = vars.map(variable => px.values(variable));
});
